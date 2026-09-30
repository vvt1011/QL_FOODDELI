using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using QL_FOODDELI.DTOs;
using QL_FOODDELI.Hubs;
using QL_FOODDELI.Repositories;
using System.Security.Claims;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DonHangController : ControllerBase
    {
        private readonly IDonHangRepository _donHangRepo;
        private readonly IGioHangRepository _gioHangRepo;
        private readonly IHubContext<DonHangHub> _hubContext;
        private readonly ILogger<DonHangController> _logger;

        public DonHangController(
            IDonHangRepository donHangRepo,
            IGioHangRepository gioHangRepo,
            IHubContext<DonHangHub> hubContext,
            ILogger<DonHangController> logger)
        {
            _donHangRepo = donHangRepo;
            _gioHangRepo = gioHangRepo;
            _hubContext = hubContext;
            _logger = logger;
        }

        // ==========================================
        // GET: api/DonHang
        // Lấy tất cả đơn hàng (Admin/QuanLy)
        // ==========================================
        [HttpGet]
        [Authorize(Roles = "Admin,QuanLy")]
        public async Task<IActionResult> GetAllDonHangs()
        {
            var donHangs = await _donHangRepo.GetAllAsync();
            return Ok(donHangs);
        }

        // ==========================================
        // GET: api/DonHang/{id}
        // Người dùng chỉ xem được đơn của mình
        // Admin/QuanLy được xem tất cả
        // ==========================================
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetDonHang(string id)
        {
            var donHang = await _donHangRepo.GetByIdAsync(id);

            if (donHang == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy đơn hàng"
                });
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("MaNguoiDung")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new
                {
                    message = "Chưa xác định người dùng"
                });
            }

            // Admin và QuanLy được xem tất cả đơn hàng
            var isAdminOrQuanLy =
                User.IsInRole("Admin") ||
                User.IsInRole("QuanLy");

            if (isAdminOrQuanLy)
            {
                return Ok(donHang);
            }

            // ChuShop chỉ được xem đơn có món thuộc cửa hàng của mình
            if (User.IsInRole("ChuShop"))
            {
                var coQuyen = await _donHangRepo.ChuShopCoQuyenCapNhatDonHangAsync(
                    userId,
                    id);

                if (!coQuyen)
                {
                    return Forbid();
                }

                return Ok(donHang);
            }

            // Khách hàng chỉ được xem đơn do chính mình đặt
            if (donHang.MaNguoiDung != userId)
            {
                return Forbid();
            }

            return Ok(donHang);
        }
        // ==========================================
        // GET: api/DonHang/{id}/lich-su-trang-thai
        // Người dùng chỉ xem lịch sử đơn của mình
        // Admin/QuanLy được xem tất cả
        // ==========================================
        [HttpGet("{id}/lich-su-trang-thai")]
        [Authorize]
        public async Task<IActionResult> GetLichSuTrangThai(string id)
        {
            var donHang = await _donHangRepo.GetByIdAsync(id);

            if (donHang == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy đơn hàng"
                });
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("MaNguoiDung")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new
                {
                    message = "Chưa xác định người dùng"
                });
            }

            // Admin và QuanLy được xem lịch sử của tất cả đơn
            var isAdminOrQuanLy =
                User.IsInRole("Admin") ||
                User.IsInRole("QuanLy");

            if (isAdminOrQuanLy)
            {
                var lichSuAdmin = await _donHangRepo.GetLichSuTrangThaiAsync(id);
                return Ok(lichSuAdmin);
            }

            // ChuShop chỉ được xem lịch sử đơn có món thuộc cửa hàng của mình
            if (User.IsInRole("ChuShop"))
            {
                var coQuyen = await _donHangRepo.ChuShopCoQuyenCapNhatDonHangAsync(
                    userId,
                    id);

                if (!coQuyen)
                {
                    return Forbid();
                }

                var lichSuChuShop =
                    await _donHangRepo.GetLichSuTrangThaiAsync(id);

                return Ok(lichSuChuShop);
            }

            // Khách hàng chỉ được xem lịch sử đơn do chính mình đặt
            if (donHang.MaNguoiDung != userId)
            {
                return Forbid();
            }

            var lichSu = await _donHangRepo.GetLichSuTrangThaiAsync(id);

            return Ok(lichSu);
        }
        // ==========================================
        // GET: api/DonHang/user
        // Lấy danh sách đơn hàng của người dùng hiện tại
        // ==========================================
        [HttpGet("user")]
        [Authorize]
        public async Task<IActionResult> GetDonHangCuaToi()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("MaNguoiDung")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Chưa đăng nhập" });
            }

            var donHangs = await _donHangRepo.GetByNguoiDungAsync(userId);

            return Ok(donHangs);
        }

        // ==========================================
        // POST: api/DonHang
        // Tạo đơn hàng & Bắn SignalR thông báo Cửa hàng
        // ==========================================
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> TaoDonHang(
            [FromBody] DonHangCreateRequest request)
        {
            if (request == null ||
                request.ChiTiets == null ||
                request.ChiTiets.Count == 0)
            {
                return BadRequest(new
                {
                    message = "Đơn hàng phải có ít nhất 1 món ăn"
                });
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("MaNguoiDung")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new
                {
                    message = "Chưa xác định người dùng"
                });
            }

            // 1. Tạo đơn hàng
            var maDonHang = await _donHangRepo.CreateAsync(userId, request);

            // 2. Xóa giỏ hàng sau khi tạo đơn thành công
            try
            {
                await _gioHangRepo.ClearGioHangAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "Lỗi khi xóa giỏ hàng sau đặt đơn {MaDonHang}",
                    maDonHang);
            }

            // 3. Bắn SignalR thời gian thực cho Cửa hàng và Admin
            try
            {
                var storeIds =
                    await _donHangRepo.GetDanhSachMaCuaHangAsync(maDonHang);

                var payload = new
                {
                    maDonHang = maDonHang,
                    maKhachHang = userId,
                    tongTien = request.TongTien,
                    thanhTien = request.ThanhTien,
                    soMon = request.ChiTiets.Count,
                    thoiGian = DateTime.Now,
                    message = $"Có đơn hàng mới #{maDonHang} vừa được đặt!"
                };

                foreach (var storeId in storeIds)
                {
                    await _hubContext.Clients
                        .Group($"shop_{storeId}")
                        .SendAsync("DonHangMoi", payload);
                }

                await _hubContext.Clients
                    .Group("shop_channel")
                    .SendAsync("DonHangMoi", payload);

                await _hubContext.Clients
                    .Group("admin_channel")
                    .SendAsync("DonHangMoi", payload);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Lỗi khi gửi SignalR đơn hàng mới {MaDonHang}",
                    maDonHang);
            }

            return Ok(new
            {
                message = "Tạo đơn hàng thành công",
                maDonHang = maDonHang
            });
        }

        // ==========================================
        // PUT: api/DonHang/cap-nhat-trang-thai/{id}
        // Cập nhật trạng thái
        // ==========================================
        [HttpPut("cap-nhat-trang-thai/{id}")]
        [Authorize(Roles = "ChuShop,Admin,QuanLy")]
        public async Task<IActionResult> CapNhatTrangThai(
            string id,
            [FromQuery] string trangThaiMoi,
            [FromQuery] string? ghiChu = null)
        {
            if (string.IsNullOrWhiteSpace(trangThaiMoi))
            {
                return BadRequest(new
                {
                    message = "Trạng thái mới không được để trống"
                });
            }

            var donHang = await _donHangRepo.GetByIdAsync(id);

            if (donHang == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy đơn hàng"
                });
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst("MaNguoiDung")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new
                {
                    message = "Chưa xác định người dùng"
                });
            }

            // =====================================================
            // KIỂM TRA QUYỀN CỦA CHUSHOP
            // Admin và QuanLy được phép cập nhật tất cả đơn
            // ChuShop chỉ được cập nhật đơn có món thuộc cửa hàng mình
            // =====================================================
            if (User.IsInRole("ChuShop"))
            {
                var coQuyen = await _donHangRepo.ChuShopCoQuyenCapNhatDonHangAsync(
                    userId,
                    id);

                if (!coQuyen)
                {
                    return Forbid();
                }
            }

            var success = await _donHangRepo.UpdateTrangThaiAsync(
                id,
                trangThaiMoi,
                userId,
                ghiChu);

            if (!success)
            {
                return BadRequest(new
                {
                    message = "Cập nhật trạng thái thất bại"
                });
            }

            // Bắn SignalR thời gian thực cho Khách hàng
            try
            {
                var payload = new
                {
                    maDonHang = id,
                    trangThaiCu = donHang.TrangThai,
                    trangThaiMoi = trangThaiMoi,
                    thoiGian = DateTime.Now,
                    ghiChu = ghiChu,
                    message =
                        $"Đơn hàng #{id} đã cập nhật sang trạng thái: {trangThaiMoi}"
                };

                if (!string.IsNullOrEmpty(donHang.MaNguoiDung))
                {
                    await _hubContext.Clients
                        .Group($"user_{donHang.MaNguoiDung}")
                        .SendAsync(
                            "CapNhatTrangThaiDonHang",
                            payload);
                }

                var storeIds =
                    await _donHangRepo.GetDanhSachMaCuaHangAsync(id);

                foreach (var storeId in storeIds)
                {
                    await _hubContext.Clients
                        .Group($"shop_{storeId}")
                        .SendAsync(
                            "CapNhatTrangThaiDonHang",
                            payload);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Lỗi khi gửi SignalR cập nhật trạng thái đơn {MaDonHang}",
                    id);
            }

            return Ok(new
            {
                message = $"Đã cập nhật đơn hàng sang '{trangThaiMoi}'",
                maDonHang = id,
                trangThaiMoi
            });
        }
        // ==========================================
        // DELETE: api/DonHang/{id}
        // Chỉ Admin được xóa
        // ==========================================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> XoaDonHang(string id)
        {
            var success = await _donHangRepo.DeleteAsync(id);

            if (!success)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy đơn hàng để xóa"
                });
            }

            return Ok(new
            {
                message = "Xóa đơn hàng thành công"
            });
        }
    }
}