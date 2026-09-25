using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QL_FOODDELI.Models;
using QL_FOODDELI.Repositories;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ThanhToanController : ControllerBase
    {
        private readonly IDonHangRepository _donHangRepo;
        private readonly IThanhToanRepository _thanhToanRepo;
        private readonly IConfiguration _config;
        private readonly ILogger<ThanhToanController> _logger;

        public ThanhToanController(
            IDonHangRepository donHangRepo,
            IThanhToanRepository thanhToanRepo,
            IConfiguration config,
            ILogger<ThanhToanController> logger)
        {
            _donHangRepo = donHangRepo;
            _thanhToanRepo = thanhToanRepo;
            _config = config;
            _logger = logger;
        }

        // =====================================================
        // POST: api/ThanhToan/momo-payment/{maDonHang}
        // =====================================================
        [HttpPost("momo-payment/{maDonHang}")]
        [Authorize]
        public async Task<IActionResult> CreateMoMoPayment(string maDonHang)
        {
            // =====================================================
            // 1. Kiểm tra đơn hàng
            // =====================================================

            var donHang =
                await _donHangRepo.GetByIdAsync(maDonHang);

            if (donHang == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy đơn hàng"
                });
            }

            // =====================================================
            // 2. Lấy user hiện tại
            // =====================================================

            var userId =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("MaNguoiDung")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new
                {
                    message = "Chưa xác định người dùng"
                });
            }

            // =====================================================
            // 3. Chỉ chủ đơn hàng mới được tạo thanh toán
            // =====================================================

            if (donHang.MaNguoiDung != userId)
            {
                return Forbid();
            }

            // =====================================================
            // 4. Lấy cấu hình MoMo
            // =====================================================

            string endpoint =
                _config["MoMo:PaymentUrl"]!;

            string partnerCode =
                _config["MoMo:PartnerCode"]!;

            string accessKey =
                _config["MoMo:AccessKey"]!;

            string secretKey =
                _config["MoMo:SecretKey"]!;

            string redirectUrl =
                _config["MoMo:RedirectUrl"]!;

            string ipnUrl =
                _config["MoMo:IpnUrl"]!;

            if (string.IsNullOrEmpty(endpoint) ||
                string.IsNullOrEmpty(partnerCode) ||
                string.IsNullOrEmpty(accessKey) ||
                string.IsNullOrEmpty(secretKey) ||
                string.IsNullOrEmpty(redirectUrl) ||
                string.IsNullOrEmpty(ipnUrl))
            {
                _logger.LogError(
                    "MoMo: Thiếu cấu hình thanh toán");

                return StatusCode(500, new
                {
                    message = "Cấu hình MoMo chưa đầy đủ"
                });
            }

            // =====================================================
            // 5. Lấy số tiền đơn hàng
            // =====================================================

            double? soTien =
                (donHang.ThanhTien.HasValue &&
                 donHang.ThanhTien.Value > 0)
                ? donHang.ThanhTien.Value
                : donHang.TongTien;

            if (!soTien.HasValue ||
                soTien.Value < 1000)
            {
                return BadRequest(new
                {
                    message =
                        "Số tiền đơn hàng không hợp lệ (phải >= 1,000 VNĐ)"
                });
            }

            long amount =
                (long)Math.Round(soTien.Value);

            // =====================================================
            // 6. Kiểm tra bản ghi thanh toán hiện tại
            // =====================================================

            var thanhToan =
                await _thanhToanRepo.GetByDonHangAsync(maDonHang);

            // Nếu đơn hàng đã thanh toán thành công
            // thì không cho tạo thanh toán MoMo lần nữa.
            if (thanhToan != null &&
                string.Equals(
                    thanhToan.TrangThai,
                    "Đã thanh toán",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "Đơn hàng đã được thanh toán"
                });
            }

            // =====================================================
            // 7. Nếu chưa có bản ghi ThanhToan thì tạo mới
            // =====================================================

            if (thanhToan == null)
            {
                thanhToan = new ThanhToan
                {
                    MaThanhToan =
                        "TT" +
                        Guid.NewGuid()
                            .ToString("N")[..10],

                    MaDonHang = maDonHang,

                    PhuongThuc = "MoMo",

                    SoTien = amount,

                    TrangThai = "Chờ thanh toán",

                    MaGiaoDich = null,

                    NgayThanhToan = null
                };

                bool created =
                    await _thanhToanRepo.CreateAsync(
                        thanhToan);

                if (!created)
                {
                    _logger.LogError(
                        "Không thể tạo bản ghi ThanhToan cho đơn {OrderId}",
                        maDonHang);

                    return StatusCode(500, new
                    {
                        message =
                            "Không thể tạo bản ghi thanh toán"
                    });
                }
            }

            // =====================================================
            // 8. Tạo thông tin request MoMo
            // =====================================================

            string orderId = maDonHang;

            string orderInfo =
                "Thanhtoandonhang_" + orderId;

            string requestType =
                "payWithMethod";

            string requestId =
                Guid.NewGuid().ToString();

            string extraData = "";

            // =====================================================
            // 9. Tạo rawHash
            // =====================================================

            string rawHash =
                "accessKey=" + accessKey
                + "&amount=" + amount
                + "&extraData=" + extraData
                + "&ipnUrl=" + ipnUrl
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + partnerCode
                + "&redirectUrl=" + redirectUrl
                + "&requestId=" + requestId
                + "&requestType=" + requestType;

            _logger.LogInformation(
                "MoMo rawHash cho đơn {OrderId}: {RawHash}",
                orderId,
                rawHash);

            // =====================================================
            // 10. Tạo chữ ký HMAC-SHA256
            // =====================================================

            string signature =
                SignHmacSHA256(
                    rawHash,
                    secretKey);

            // =====================================================
            // 11. Tạo request body
            // =====================================================

            var requestBody = new JsonObject
            {
                ["partnerCode"] = partnerCode,
                ["partnerName"] = "QL_FOODDELI",
                ["storeId"] = partnerCode,
                ["requestId"] = requestId,
                ["amount"] = amount,
                ["orderId"] = orderId,
                ["orderInfo"] = orderInfo,
                ["redirectUrl"] = redirectUrl,
                ["ipnUrl"] = ipnUrl,
                ["requestType"] = requestType,
                ["extraData"] = extraData,
                ["lang"] = "vi",
                ["signature"] = signature
            };

            _logger.LogInformation(
                "MoMo request cho đơn {OrderId}: {Body}",
                orderId,
                requestBody.ToJsonString());

            // =====================================================
            // 12. Gửi request sang MoMo
            // =====================================================

            using var httpClient =
                new HttpClient();

            var response =
                await httpClient.PostAsync(
                    endpoint,
                    new StringContent(
                        requestBody.ToJsonString(),
                        Encoding.UTF8,
                        "application/json"));

            string responseString =
                await response.Content.ReadAsStringAsync();

            _logger.LogInformation(
                "MoMo response cho đơn {OrderId}: {Response}",
                orderId,
                responseString);

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode(
                    (int)response.StatusCode,
                    new
                    {
                        message =
                            "MoMo từ chối yêu cầu thanh toán",
                        response = responseString
                    });
            }

            try
            {
                var responseContent =
                    JsonSerializer.Deserialize<JsonElement>(
                        responseString);

                return Ok(responseContent);
            }
            catch
            {
                return Ok(new
                {
                    message = "Đã gửi yêu cầu tới MoMo",
                    response = responseString
                });
            }
        }

        // =====================================================
        // GET: api/ThanhToan/momo-return
        // =====================================================
        [HttpGet("momo-return")]
        [AllowAnonymous]
        public IActionResult MoMoReturn(
            [FromQuery] string partnerCode,
            [FromQuery] string orderId,
            [FromQuery] string requestId,
            [FromQuery] long amount,
            [FromQuery] string orderInfo,
            [FromQuery] string orderType,
            [FromQuery] long transId,
            [FromQuery] int resultCode,
            [FromQuery] string message,
            [FromQuery] string payType,
            [FromQuery] long responseTime,
            [FromQuery] string extraData,
            [FromQuery] string signature)
        {
            try
            {
                string accessKey =
                    _config["MoMo:AccessKey"]!;

                string secretKey =
                    _config["MoMo:SecretKey"]!;

                string configuredPartnerCode =
                    _config["MoMo:PartnerCode"]!;

                // =====================================================
                // Kiểm tra PartnerCode
                // =====================================================

                if (!string.Equals(
                        partnerCode,
                        configuredPartnerCode,
                        StringComparison.Ordinal))
                {
                    _logger.LogWarning(
                        "MoMo Return: PartnerCode không hợp lệ cho đơn {OrderId}",
                        orderId);

                    return BadRequest(new
                    {
                        message = "PartnerCode không hợp lệ",
                        resultCode = -1
                    });
                }

                // =====================================================
                // Tạo rawHash
                // =====================================================

                string rawHash =
                    "accessKey=" + accessKey
                    + "&amount=" + amount
                    + "&extraData=" + extraData
                    + "&message=" + message
                    + "&orderId=" + orderId
                    + "&orderInfo=" + orderInfo
                    + "&orderType=" + orderType
                    + "&partnerCode=" + partnerCode
                    + "&payType=" + payType
                    + "&requestId=" + requestId
                    + "&responseTime=" + responseTime
                    + "&resultCode=" + resultCode
                    + "&transId=" + transId;

                string checkSignature =
                    SignHmacSHA256(
                        rawHash,
                        secretKey);

                // =====================================================
                // Kiểm tra chữ ký
                // =====================================================

                if (!string.Equals(
                        checkSignature,
                        signature,
                        StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning(
                        "MoMo Return: Chữ ký không hợp lệ cho đơn {OrderId}",
                        orderId);

                    return BadRequest(new
                    {
                        message = "Chữ ký không hợp lệ",
                        resultCode = -1
                    });
                }

                // =====================================================
                // KHÔNG cập nhật DB tại Return
                //
                // IPN mới là nơi cập nhật trạng thái thanh toán.
                // =====================================================

                if (resultCode == 0)
                {
                    return Ok(new
                    {
                        message = "Thanh toán thành công",
                        orderId,
                        transId,
                        resultCode
                    });
                }

                return Ok(new
                {
                    message = "Thanh toán thất bại",
                    orderId,
                    resultCode,
                    errorMessage = message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "MoMo Return: Lỗi xử lý callback");

                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Lỗi xử lý kết quả thanh toán MoMo"
                    });
            }
        }

        // =====================================================
        // POST: api/ThanhToan/momo-ipn
        // =====================================================
        [HttpPost("momo-ipn")]
        [AllowAnonymous]
        public async Task<IActionResult> MoMoIpn(
            [FromBody] JsonElement request)
        {
            try
            {
                string accessKey =
                    _config["MoMo:AccessKey"]!;

                string secretKey =
                    _config["MoMo:SecretKey"]!;

                string configuredPartnerCode =
                    _config["MoMo:PartnerCode"]!;

                // =====================================================
                // 1. Lấy dữ liệu từ MoMo
                // =====================================================

                int resultCode =
                    request.GetProperty(
                        "resultCode")
                    .GetInt32();

                string orderId =
                    request.GetProperty(
                        "orderId")
                    .GetString()!;

                string requestId =
                    request.GetProperty(
                        "requestId")
                    .GetString()!;

                long amount =
                    request.GetProperty(
                        "amount")
                    .GetInt64();

                string orderInfo =
                    request.GetProperty(
                        "orderInfo")
                    .GetString()!;

                string orderType =
                    request.GetProperty(
                        "orderType")
                    .GetString()!;

                long transId =
                    request.GetProperty(
                        "transId")
                    .GetInt64();

                string message =
                    request.GetProperty(
                        "message")
                    .GetString()!;

                string payType =
                    request.GetProperty(
                        "payType")
                    .GetString()!;

                long responseTime =
                    request.GetProperty(
                        "responseTime")
                    .GetInt64();

                string extraData =
                    request.GetProperty(
                        "extraData")
                    .GetString()!;

                string signature =
                    request.GetProperty(
                        "signature")
                    .GetString()!;

                string partnerCode =
                    request.GetProperty(
                        "partnerCode")
                    .GetString()!;

                // =====================================================
                // 2. Kiểm tra PartnerCode
                // =====================================================

                if (!string.Equals(
                        partnerCode,
                        configuredPartnerCode,
                        StringComparison.Ordinal))
                {
                    _logger.LogWarning(
                        "MoMo IPN: PartnerCode không hợp lệ. " +
                        "Nhận={PartnerCode}",
                        partnerCode);

                    return NoContent();
                }

                // =====================================================
                // 3. Kiểm tra đơn hàng
                // =====================================================

                var donHang =
                    await _donHangRepo.GetByIdAsync(
                        orderId);

                if (donHang == null)
                {
                    _logger.LogWarning(
                        "MoMo IPN: Không tìm thấy đơn hàng {OrderId}",
                        orderId);

                    return NoContent();
                }

                // =====================================================
                // 4. Kiểm tra orderInfo
                // =====================================================

                string expectedOrderInfo =
                    "Thanhtoandonhang_" + orderId;

                if (!string.Equals(
                        orderInfo,
                        expectedOrderInfo,
                        StringComparison.Ordinal))
                {
                    _logger.LogWarning(
                        "MoMo IPN: OrderInfo không hợp lệ cho đơn {OrderId}",
                        orderId);

                    return NoContent();
                }

                // =====================================================
                // 5. Kiểm tra số tiền
                // =====================================================

                double? soTienDonHang =
                    (donHang.ThanhTien.HasValue &&
                     donHang.ThanhTien.Value > 0)
                    ? donHang.ThanhTien.Value
                    : donHang.TongTien;

                if (!soTienDonHang.HasValue)
                {
                    _logger.LogWarning(
                        "MoMo IPN: Đơn hàng {OrderId} không có số tiền",
                        orderId);

                    return NoContent();
                }

                long expectedAmount =
                    (long)Math.Round(
                        soTienDonHang.Value);

                if (amount != expectedAmount)
                {
                    _logger.LogWarning(
                        "MoMo IPN: Sai số tiền đơn {OrderId}. " +
                        "MoMo={MoMoAmount}, DB={DbAmount}",
                        orderId,
                        amount,
                        expectedAmount);

                    return NoContent();
                }

                // =====================================================
                // 6. Kiểm tra bản ghi ThanhToan
                // =====================================================

                var thanhToan =
                    await _thanhToanRepo.GetByDonHangAsync(
                        orderId);

                if (thanhToan == null)
                {
                    _logger.LogWarning(
                        "MoMo IPN: Không tìm thấy bản ghi ThanhToan " +
                        "của đơn {OrderId}",
                        orderId);

                    return NoContent();
                }

                // =====================================================
                // 7. Kiểm tra số tiền trong ThanhToan
                // =====================================================

                if (thanhToan.SoTien.HasValue)
                {
                    long expectedPaymentAmount =
                        (long)Math.Round(
                            thanhToan.SoTien.Value);

                    if (amount != expectedPaymentAmount)
                    {
                        _logger.LogWarning(
                            "MoMo IPN: Số tiền không khớp bản ghi ThanhToan " +
                            "của đơn {OrderId}",
                            orderId);

                        return NoContent();
                    }
                }

                // =====================================================
                // 8. Nếu đã thanh toán thành công rồi
                //
                // MoMo có thể gửi lại IPN.
                // Không xử lý lại giao dịch.
                // =====================================================

                if (string.Equals(
                        thanhToan.TrangThai,
                        "Đã thanh toán",
                        StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogInformation(
                        "MoMo IPN: Đơn {OrderId} đã được thanh toán trước đó. " +
                        "Bỏ qua IPN trùng.",
                        orderId);

                    return NoContent();
                }

                // =====================================================
                // 9. Tạo rawHash kiểm tra chữ ký
                // =====================================================

                string rawHash =
                    "accessKey=" + accessKey
                    + "&amount=" + amount
                    + "&extraData=" + extraData
                    + "&message=" + message
                    + "&orderId=" + orderId
                    + "&orderInfo=" + orderInfo
                    + "&orderType=" + orderType
                    + "&partnerCode=" + partnerCode
                    + "&payType=" + payType
                    + "&requestId=" + requestId
                    + "&responseTime=" + responseTime
                    + "&resultCode=" + resultCode
                    + "&transId=" + transId;

                string checkSignature =
                    SignHmacSHA256(
                        rawHash,
                        secretKey);

                // =====================================================
                // 10. Kiểm tra chữ ký
                // =====================================================

                if (!string.Equals(
                        checkSignature,
                        signature,
                        StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning(
                        "MoMo IPN: Chữ ký không hợp lệ cho đơn {OrderId}",
                        orderId);

                    return NoContent();
                }

                // =====================================================
                // 11. Thanh toán thành công
                // =====================================================

                if (resultCode == 0)
                {
                    bool updated =
                        await _thanhToanRepo.UpdateTrangThaiAsync(
                            orderId,
                            "Đã thanh toán",
                            transId.ToString(),
                            DateTime.Now);

                    if (updated)
                    {
                        _logger.LogInformation(
                            "MoMo IPN: Thanh toán đơn {OrderId} " +
                            "thành công. TransId={TransId}",
                            orderId,
                            transId);
                    }
                    else
                    {
                        _logger.LogWarning(
                            "MoMo IPN: Không thể cập nhật ThanhToan " +
                            "của đơn {OrderId}",
                            orderId);
                    }
                }
                else
                {
                    // =================================================
                    // 12. Thanh toán thất bại / hủy
                    // =================================================

                    bool updated =
                        await _thanhToanRepo.UpdateTrangThaiAsync(
                            orderId,
                            "Thanh toán thất bại",
                            transId > 0
                                ? transId.ToString()
                                : null,
                            null);

                    if (updated)
                    {
                        _logger.LogInformation(
                            "MoMo IPN: Thanh toán đơn {OrderId} " +
                            "thất bại. ResultCode={ResultCode}, Message={Message}",
                            orderId,
                            resultCode,
                            message);
                    }
                    else
                    {
                        _logger.LogWarning(
                            "MoMo IPN: Không thể cập nhật ThanhToan " +
                            "của đơn {OrderId}",
                            orderId);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "MoMo IPN: Lỗi xử lý IPN callback");
            }

            // =====================================================
            // MoMo yêu cầu IPN phản hồi HTTP 204
            // =====================================================

            return NoContent();
        }

        // =====================================================
        // HÀM TÍNH CHỮ KÝ HMAC-SHA256
        // =====================================================

        private static string SignHmacSHA256(
            string message,
            string secretKey)
        {
            byte[] keyByte =
                Encoding.UTF8.GetBytes(
                    secretKey);

            byte[] messageBytes =
                Encoding.UTF8.GetBytes(
                    message);

            using var hmac =
                new HMACSHA256(keyByte);

            byte[] hashBytes =
                hmac.ComputeHash(
                    messageBytes);

            StringBuilder sb =
                new StringBuilder(
                    hashBytes.Length * 2);

            foreach (byte b in hashBytes)
            {
                sb.Append(
                    b.ToString("x2"));
            }

            return sb.ToString();
        }
    }
}