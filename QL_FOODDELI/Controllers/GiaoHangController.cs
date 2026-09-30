using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QL_FOODDELI.Data;
using QL_FOODDELI.Models;
using QL_FOODDELI.Repositories;
using System.Security.Claims;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GiaoHangController : ControllerBase
    {
        private readonly DapperContext _context;
        private readonly IDonHangRepository _donHangRepo;

        public GiaoHangController(
            DapperContext context,
            IDonHangRepository donHangRepo)
        {
            _context = context;
            _donHangRepo = donHangRepo;
        }

        // =====================================================
        // GET: api/GiaoHang
        // Admin / QuanLy xem tất cả
        // =====================================================
        [HttpGet]
        [Authorize(Roles = "Admin,QuanLy")]
        public async Task<IActionResult> GetGiaoHangs()
        {
            using var conn = _context.CreateConnection();

            var list = await conn.QueryAsync<GiaoHang>(
                "SELECT * FROM GiaoHang ORDER BY ThoiGianNhan DESC");

            return Ok(list);
        }

        // =====================================================
        // GET: api/GiaoHang/{id}
        // Admin / QuanLy: xem tất cả
        // ChuShop: chỉ xem đơn thuộc shop mình
        // =====================================================
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,QuanLy,ChuShop")]
        public async Task<IActionResult> GetGiaoHang(string id)
        {
            using var conn = _context.CreateConnection();

            var item = await conn.QueryFirstOrDefaultAsync<GiaoHang>(
                @"SELECT *
                  FROM GiaoHang
                  WHERE MaGiaoHang = @MaGiaoHang",
                new
                {
                    MaGiaoHang = id
                });

            if (item == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay thong tin giao hang"
                });
            }

            // Admin và QuanLy được xem tất cả
            if (User.IsInRole("Admin") ||
                User.IsInRole("QuanLy"))
            {
                return Ok(item);
            }

            // =====================================================
            // ChuShop
            // =====================================================

            var userId =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("MaNguoiDung")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new
                {
                    message = "Chua xac dinh nguoi dung"
                });
            }

            if (string.IsNullOrEmpty(item.MaDonHang))
            {
                return BadRequest(new
                {
                    message = "MaDonHang cua giao hang khong hop le"
                });
            }

            var coQuyen =
                await _donHangRepo
                    .ChuShopCoQuyenCapNhatDonHangAsync(
                        userId,
                        item.MaDonHang);

            if (!coQuyen)
            {
                return Forbid();
            }

            return Ok(item);
        }

        // =====================================================
        // POST: api/GiaoHang
        // Admin / QuanLy / ChuShop
        // =====================================================
        [HttpPost]
        [Authorize(Roles = "Admin,QuanLy,ChuShop")]
        public async Task<IActionResult> CreateGiaoHang(
            [FromBody] GiaoHang giaoHang)
        {
            if (giaoHang == null)
            {
                return BadRequest(new
                {
                    message = "Du lieu khong hop le"
                });
            }

            // =====================================================
            // Kiểm tra MaDonHang
            // =====================================================

            if (string.IsNullOrEmpty(giaoHang.MaDonHang))
            {
                return BadRequest(new
                {
                    message = "MaDonHang khong duoc de trong"
                });
            }

            // =====================================================
            // Kiểm tra đơn hàng tồn tại
            // =====================================================

            var donHang =
                await _donHangRepo
                    .GetByIdAsync(giaoHang.MaDonHang);

            if (donHang == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay don hang"
                });
            }

            // =====================================================
            // ChuShop chỉ được tạo giao hàng
            // cho đơn thuộc cửa hàng của mình
            // =====================================================

            if (User.IsInRole("ChuShop"))
            {
                var userId =
                    User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst("MaNguoiDung")?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new
                    {
                        message = "Chua xac dinh nguoi dung"
                    });
                }

                var coQuyen =
                    await _donHangRepo
                        .ChuShopCoQuyenCapNhatDonHangAsync(
                            userId,
                            giaoHang.MaDonHang);

                if (!coQuyen)
                {
                    return Forbid();
                }
            }

            // =====================================================
            // Không cho tạo giao hàng trùng cho cùng đơn
            // =====================================================

            using var conn = _context.CreateConnection();

            var daCoGiaoHang =
                await conn.ExecuteScalarAsync<int>(
                    @"SELECT COUNT(1)
                      FROM GiaoHang
                      WHERE MaDonHang = @MaDonHang",
                    new
                    {
                        MaDonHang = giaoHang.MaDonHang
                    });

            if (daCoGiaoHang > 0)
            {
                return Conflict(new
                {
                    message = "Don hang nay da co thong tin giao hang"
                });
            }

            // =====================================================
            // Tạo mã giao hàng
            // =====================================================

            if (string.IsNullOrEmpty(giaoHang.MaGiaoHang))
            {
                giaoHang.MaGiaoHang =
                    "GH" +
                    Guid.NewGuid()
                        .ToString("N")[..10];
            }

            // =====================================================
            // Thời gian nhận
            // =====================================================

            if (!giaoHang.ThoiGianNhan.HasValue)
            {
                giaoHang.ThoiGianNhan =
                    DateTime.Now;
            }

            // =====================================================
            // Trạng thái mặc định
            // =====================================================

            if (string.IsNullOrEmpty(giaoHang.TrangThai))
            {
                giaoHang.TrangThai = "Chờ giao";
            }

            // =====================================================
            // INSERT
            // =====================================================

            const string sql = @"
                INSERT INTO GiaoHang
                (
                    MaGiaoHang,
                    MaDonHang,
                    MaNguoiGiaoHang,
                    TrangThai,
                    ThoiGianNhan,
                    GhiChu
                )
                VALUES
                (
                    @MaGiaoHang,
                    @MaDonHang,
                    @MaNguoiGiaoHang,
                    @TrangThai,
                    @ThoiGianNhan,
                    @GhiChu
                )";

            await conn.ExecuteAsync(
                sql,
                giaoHang);

            return Ok(new
            {
                message = "Tao giao hang thanh cong",
                maGiaoHang = giaoHang.MaGiaoHang
            });
        }
    }
}