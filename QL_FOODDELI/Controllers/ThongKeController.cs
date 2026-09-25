using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QL_FOODDELI.Repositories;
using System.Security.Claims;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,QuanLy,ChuShop")]
    public class ThongKeController : ControllerBase
    {
        private readonly IThongKeRepository _thongKeRepo;
        private readonly ICuaHangRepository _cuaHangRepo;

        public ThongKeController(
            IThongKeRepository thongKeRepo,
            ICuaHangRepository cuaHangRepo)
        {
            _thongKeRepo = thongKeRepo;
            _cuaHangRepo = cuaHangRepo;
        }

        // =====================================================
        // Xác định cửa hàng mà người dùng được phép xem thống kê
        // =====================================================
        private async Task<(bool Allowed, string? MaCuaHang)> ResolveMaCuaHangAsync(
            string? requestedMaCuaHang)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var userId =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("MaNguoiDung")?.Value;

            // =================================================
            // CHUSHOP
            // Chỉ được xem thống kê cửa hàng của chính mình
            // =================================================
            if (userRole == "ChuShop")
            {
                if (string.IsNullOrWhiteSpace(userId))
                    return (false, null);

                var shops = await _cuaHangRepo.GetByChuShopAsync(userId);

                if (shops == null || !shops.Any())
                    return (false, null);

                // Nếu ChuShop không truyền MaCuaHang:
                // - Nếu chỉ có 1 cửa hàng -> dùng cửa hàng đó
                // - Nếu có nhiều cửa hàng -> yêu cầu truyền MaCuaHang
                if (string.IsNullOrWhiteSpace(requestedMaCuaHang))
                {
                    if (shops.Count() == 1)
                    {
                        return (true, shops.First().MaCuaHang);
                    }

                    return (false, null);
                }

                // ChuShop có truyền MaCuaHang:
                // phải kiểm tra cửa hàng đó thực sự thuộc ChuShop
                var shopDuocYeuCau = shops.FirstOrDefault(
                    x => string.Equals(
                        x.MaCuaHang,
                        requestedMaCuaHang,
                        StringComparison.OrdinalIgnoreCase));

                if (shopDuocYeuCau == null)
                    return (false, null);

                return (true, shopDuocYeuCau.MaCuaHang);
            }

            // =================================================
            // ADMIN / QUANLY
            // Được xem toàn hệ thống hoặc filter cửa hàng
            // =================================================
            return (true, requestedMaCuaHang);
        }

        // =====================================================
        // GET: api/ThongKe/doanh-thu
        // Thống kê doanh thu theo ngày, tuần, tháng
        // =====================================================
        [HttpGet("doanh-thu")]
        public async Task<IActionResult> GetDoanhThu(
            [FromQuery] DateTime? tuNgay = null,
            [FromQuery] DateTime? denNgay = null,
            [FromQuery] string loai = "ngay",
            [FromQuery] string? maCuaHang = null)
        {
            var resolve = await ResolveMaCuaHangAsync(maCuaHang);

            if (!resolve.Allowed)
                return Forbid();

            var result = await _thongKeRepo.GetDoanhThuAsync(
                tuNgay,
                denNgay,
                loai,
                resolve.MaCuaHang);

            return Ok(result);
        }

        // =====================================================
        // GET: api/ThongKe/top-mon-an
        // Thống kê top món ăn bán chạy nhất
        // =====================================================
        [HttpGet("top-mon-an")]
        public async Task<IActionResult> GetTopMonAn(
            [FromQuery] DateTime? tuNgay = null,
            [FromQuery] DateTime? denNgay = null,
            [FromQuery] int top = 5,
            [FromQuery] string? maCuaHang = null)
        {
            if (top <= 0)
                return BadRequest(new
                {
                    message = "Tham so top phai lon hon 0"
                });

            var resolve = await ResolveMaCuaHangAsync(maCuaHang);

            if (!resolve.Allowed)
                return Forbid();

            var result = await _thongKeRepo.GetTopMonAnAsync(
                top,
                tuNgay,
                denNgay,
                resolve.MaCuaHang);

            return Ok(result);
        }

        // =====================================================
        // GET: api/ThongKe/tong-quan
        // Thống kê tổng quan nhanh hệ thống
        // =====================================================
        [HttpGet("tong-quan")]
        public async Task<IActionResult> GetTongQuan(
            [FromQuery] string? maCuaHang = null)
        {
            var resolve = await ResolveMaCuaHangAsync(maCuaHang);

            if (!resolve.Allowed)
                return Forbid();

            var result = await _thongKeRepo.GetTongQuanAsync(
                resolve.MaCuaHang);

            return Ok(result);
        }
    }
}