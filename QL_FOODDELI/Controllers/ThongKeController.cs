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
        // XÁC ĐỊNH CỬA HÀNG ĐƯỢC PHÉP XEM THỐNG KÊ
        // =====================================================
        private async Task<(bool Allowed, string? MaCuaHang)> ResolveMaCuaHangAsync(
            string? requestedMaCuaHang)
        {
            // =================================================
            // ADMIN / QUANLY
            // Được xem toàn hệ thống
            // =================================================
            if (User.IsInRole("Admin") || User.IsInRole("QuanLy"))
            {
                return (true, requestedMaCuaHang);
            }


            // =================================================
            // CHUSHOP
            // Chỉ được xem cửa hàng của chính mình
            // =================================================
            if (User.IsInRole("ChuShop"))
            {
                var userId =
                    User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst("MaNguoiDung")?.Value
                    ?? User.FindFirst("nameid")?.Value;

                if (string.IsNullOrWhiteSpace(userId))
                {
                    return (false, null);
                }


                var shops =
                    await _cuaHangRepo.GetByChuShopAsync(userId);


                if (shops == null || !shops.Any())
                {
                    return (false, null);
                }


                // ---------------------------------------------
                // Không truyền mã cửa hàng
                // ---------------------------------------------
                if (string.IsNullOrWhiteSpace(requestedMaCuaHang))
                {
                    // Chỉ có 1 cửa hàng
                    if (shops.Count() == 1)
                    {
                        return (
                            true,
                            shops.First().MaCuaHang
                        );
                    }


                    // Có nhiều cửa hàng thì bắt buộc
                    // phải truyền mã cửa hàng
                    return (false, null);
                }


                // ---------------------------------------------
                // Có truyền mã cửa hàng
                // Kiểm tra cửa hàng có thuộc ChuShop không
                // ---------------------------------------------
                var shopDuocYeuCau =
                    shops.FirstOrDefault(
                        x => string.Equals(
                            x.MaCuaHang,
                            requestedMaCuaHang,
                            StringComparison.OrdinalIgnoreCase
                        )
                    );


                if (shopDuocYeuCau == null)
                {
                    return (false, null);
                }


                return (
                    true,
                    shopDuocYeuCau.MaCuaHang
                );
            }


            // Không thuộc các role được phép
            return (false, null);
        }


        // =====================================================
        // GET: api/ThongKe/doanh-thu
        // =====================================================
        [HttpGet("doanh-thu")]
        public async Task<IActionResult> GetDoanhThu(
            [FromQuery] DateTime? tuNgay = null,
            [FromQuery] DateTime? denNgay = null,
            [FromQuery] string loai = "ngay",
            [FromQuery] string? maCuaHang = null)
        {
            var resolve =
                await ResolveMaCuaHangAsync(maCuaHang);


            if (!resolve.Allowed)
            {
                return Forbid();
            }


            var result =
                await _thongKeRepo.GetDoanhThuAsync(
                    tuNgay,
                    denNgay,
                    loai,
                    resolve.MaCuaHang
                );


            return Ok(result);
        }


        // =====================================================
        // GET: api/ThongKe/top-mon-an
        // =====================================================
        [HttpGet("top-mon-an")]
        public async Task<IActionResult> GetTopMonAn(
            [FromQuery] DateTime? tuNgay = null,
            [FromQuery] DateTime? denNgay = null,
            [FromQuery] int top = 5,
            [FromQuery] string? maCuaHang = null)
        {
            if (top <= 0)
            {
                return BadRequest(new
                {
                    message = "Tham so top phai lon hon 0"
                });
            }


            var resolve =
                await ResolveMaCuaHangAsync(maCuaHang);


            if (!resolve.Allowed)
            {
                return Forbid();
            }


            var result =
                await _thongKeRepo.GetTopMonAnAsync(
                    top,
                    tuNgay,
                    denNgay,
                    resolve.MaCuaHang
                );


            return Ok(result);
        }


        // =====================================================
        // GET: api/ThongKe/tong-quan
        // =====================================================
        [HttpGet("tong-quan")]
        public async Task<IActionResult> GetTongQuan(
            [FromQuery] string? maCuaHang = null)
        {
            var resolve =
                await ResolveMaCuaHangAsync(maCuaHang);


            if (!resolve.Allowed)
            {
                return Forbid();
            }


            var result =
                await _thongKeRepo.GetTongQuanAsync(
                    resolve.MaCuaHang
                );


            return Ok(result);
        }
    }
}