using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QL_FOODDELI.Data;
using QL_FOODDELI.Models;
using System.Security.Claims;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DanhGiaController : ControllerBase
    {
        private readonly DapperContext _context;

        public DanhGiaController(DapperContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET: api/DanhGia
        // =====================================================
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetDanhGias()
        {
            using var conn = _context.CreateConnection();

            var danhGias = await conn.QueryAsync<DanhGia>(
                @"SELECT *
                  FROM DanhGia
                  ORDER BY NgayDanhGia DESC");

            return Ok(danhGias);
        }

        // =====================================================
        // GET: api/DanhGia/{id}
        // =====================================================
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDanhGia(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new
                {
                    message = "Ma danh gia khong hop le"
                });
            }

            using var conn = _context.CreateConnection();

            var danhGia = await conn.QueryFirstOrDefaultAsync<DanhGia>(
                @"SELECT *
                  FROM DanhGia
                  WHERE MaDanhGia = @MaDanhGia",
                new
                {
                    MaDanhGia = id
                });

            if (danhGia == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay danh gia"
                });
            }

            return Ok(danhGia);
        }

        // =====================================================
        // POST: api/DanhGia
        // Khách hàng tạo đánh giá món ăn
        // =====================================================
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateDanhGia(
            [FromBody] DanhGia danhGia)
        {
            // -------------------------------------------------
            // 1. Kiểm tra dữ liệu null trước
            // -------------------------------------------------
            if (danhGia == null)
            {
                return BadRequest(new
                {
                    message = "Du lieu khong hop le"
                });
            }

            // -------------------------------------------------
            // 2. Kiểm tra số sao
            // -------------------------------------------------
            if (danhGia.SoSao < 1 || danhGia.SoSao > 5)
            {
                return BadRequest(new
                {
                    message = "So sao phai tu 1 den 5"
                });
            }

            // -------------------------------------------------
            // 3. Lấy MaNguoiDung từ JWT
            // Không cho client tự gán người đánh giá
            // -------------------------------------------------
            var userId =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("MaNguoiDung")?.Value;

            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized(new
                {
                    message = "Chua xac dinh nguoi dung"
                });
            }

            danhGia.MaNguoiDung = userId;

            // -------------------------------------------------
            // 4. Kiểm tra MaMonAn
            // -------------------------------------------------
            if (string.IsNullOrWhiteSpace(danhGia.MaMonAn))
            {
                return BadRequest(new
                {
                    message = "MaMonAn khong duoc de trong"
                });
            }

            // -------------------------------------------------
            // 5. Kiểm tra món ăn có tồn tại
            // -------------------------------------------------
            using var conn = _context.CreateConnection();

            var monAnExists = await conn.ExecuteScalarAsync<int>(
                @"SELECT COUNT(1)
                  FROM MonAn
                  WHERE MaMonAn = @MaMonAn",
                new
                {
                    MaMonAn = danhGia.MaMonAn
                });

            if (monAnExists == 0)
            {
                return NotFound(new
                {
                    message = "Khong tim thay mon an"
                });
            }

            // -------------------------------------------------
            // 6. Nếu có MaDonHang thì kiểm tra đơn hàng tồn tại
            // -------------------------------------------------
            if (!string.IsNullOrWhiteSpace(danhGia.MaDonHang))
            {
                var donHangExists = await conn.ExecuteScalarAsync<int>(
                    @"SELECT COUNT(1)
                      FROM DonHang
                      WHERE MaDonHang = @MaDonHang",
                    new
                    {
                        MaDonHang = danhGia.MaDonHang
                    });

                if (donHangExists == 0)
                {
                    return NotFound(new
                    {
                        message = "Khong tim thay don hang"
                    });
                }
            }

            // -------------------------------------------------
            // 7. Tạo mã đánh giá nếu client không truyền
            // -------------------------------------------------
            if (string.IsNullOrWhiteSpace(danhGia.MaDanhGia))
            {
                danhGia.MaDanhGia =
                    "DG" + Guid.NewGuid().ToString("N")[..10];
            }

            danhGia.NgayDanhGia = DateTime.Now;

            // -------------------------------------------------
            // 8. Thêm đánh giá
            // -------------------------------------------------
            const string sql = @"
                INSERT INTO DanhGia
                (
                    MaDanhGia,
                    MaNguoiDung,
                    MaMonAn,
                    MaDonHang,
                    SoSao,
                    NoiDung,
                    NgayDanhGia
                )
                VALUES
                (
                    @MaDanhGia,
                    @MaNguoiDung,
                    @MaMonAn,
                    @MaDonHang,
                    @SoSao,
                    @NoiDung,
                    @NgayDanhGia
                )";

            var rows = await conn.ExecuteAsync(sql, danhGia);

            if (rows == 0)
            {
                return BadRequest(new
                {
                    message = "Khong the tao danh gia"
                });
            }

            return Ok(new
            {
                message = "Danh gia thanh cong",
                maDanhGia = danhGia.MaDanhGia
            });
        }

        // =====================================================
        // DELETE: api/DanhGia/{id}
        // Chỉ Admin / QuanLy được xóa
        // =====================================================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,QuanLy")]
        public async Task<IActionResult> DeleteDanhGia(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new
                {
                    message = "Ma danh gia khong hop le"
                });
            }

            using var conn = _context.CreateConnection();

            var rows = await conn.ExecuteAsync(
                @"DELETE FROM DanhGia
                  WHERE MaDanhGia = @MaDanhGia",
                new
                {
                    MaDanhGia = id
                });

            if (rows == 0)
            {
                return NotFound(new
                {
                    message = "Khong tim thay danh gia de xoa"
                });
            }

            return Ok(new
            {
                message = "Xoa danh gia thanh cong"
            });
        }
    }
}