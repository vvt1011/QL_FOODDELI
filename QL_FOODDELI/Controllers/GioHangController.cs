using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QL_FOODDELI.Models;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GioHangController : ControllerBase
    {
        private readonly QLFoodDeliContext _context;

        public GioHangController(QLFoodDeliContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET: api/GioHang/nguoidung/1
        // Lấy giỏ hàng của người dùng
        // =====================================================
        // GET: api/GioHang/nguoidung/1
        // GET: api/GioHang/nguoidung/1
        [HttpGet("nguoidung/{maNguoiDung}")]
        public async Task<IActionResult> GetGioHang(int maNguoiDung)
        {
            // Tìm giỏ hàng
            var gioHang = await _context.GioHangs
                .FirstOrDefaultAsync(x => x.MaNguoiDung == maNguoiDung);

            if (gioHang == null)
            {
                return NotFound(new
                {
                    message = "Người dùng chưa có giỏ hàng"
                });
            }

            // Lấy chi tiết giỏ hàng + thông tin món ăn
            var danhSachMon = await (
                from ct in _context.ChiTietGioHangs
                join mon in _context.MonAns
                    on ct.MaMonAn equals mon.MaMonAn
                where ct.MaGioHang == gioHang.MaGioHang
                select new
                {
                    maChiTietGioHang = ct.MaChiTietGioHang,
                    maMonAn = ct.MaMonAn,
                    tenMonAn = mon.TenMonAn,
                    soLuong = ct.SoLuong,
                    gia = ct.Gia,
                    thanhTien = ct.SoLuong * ct.Gia
                }
            ).ToListAsync();

            // Tính tổng tiền
            var tongTien = danhSachMon.Sum(x => x.thanhTien);

            return Ok(new
            {
                maGioHang = gioHang.MaGioHang,
                maNguoiDung = gioHang.MaNguoiDung,
                ngayTao = gioHang.NgayTao,
                ngayCapNhat = gioHang.NgayCapNhat,
                danhSachMon = danhSachMon,
                tongTien = tongTien
            });
        }
        // =====================================================
        // POST: api/GioHang/them
        // Thêm món vào giỏ hàng
        // =====================================================
        [HttpPost("them")]
        public async Task<IActionResult> ThemVaoGioHang(
            int maNguoiDung,
            int maMonAn,
            int soLuong)
        {
            if (soLuong <= 0)
            {
                return BadRequest(new
                {
                    message = "Số lượng phải lớn hơn 0"
                });
            }

            // Kiểm tra người dùng
            var nguoiDung = await _context.NguoiDungs
                .FindAsync(maNguoiDung);

            if (nguoiDung == null)
            {
                return NotFound(new
                {
                    message = "Người dùng không tồn tại"
                });
            }

            // Kiểm tra món ăn
            var monAn = await _context.MonAns
                .FindAsync(maMonAn);

            if (monAn == null)
            {
                return NotFound(new
                {
                    message = "Món ăn không tồn tại"
                });
            }

            // Tìm giỏ hàng
            var gioHang = await _context.GioHangs
                .FirstOrDefaultAsync(x => x.MaNguoiDung == maNguoiDung);

            // Nếu chưa có giỏ hàng thì tạo
            if (gioHang == null)
            {
                gioHang = new GioHang
                {
                    MaNguoiDung = maNguoiDung,
                    NgayTao = DateTime.Now,
                    NgayCapNhat = DateTime.Now
                };

                _context.GioHangs.Add(gioHang);

                await _context.SaveChangesAsync();
            }

            // Kiểm tra món đã có trong giỏ chưa
            var chiTiet = await _context.ChiTietGioHangs
                .FirstOrDefaultAsync(x =>
                    x.MaGioHang == gioHang.MaGioHang &&
                    x.MaMonAn == maMonAn);

            if (chiTiet != null)
            {
                // Đã có → cộng thêm số lượng
                chiTiet.SoLuong += soLuong;
                chiTiet.Gia = monAn.Gia;
            }
            else
            {
                // Chưa có → thêm mới
                chiTiet = new ChiTietGioHang
                {
                    MaGioHang = gioHang.MaGioHang,
                    MaMonAn = maMonAn,
                    SoLuong = soLuong,
                    Gia = monAn.Gia
                };

                _context.ChiTietGioHangs.Add(chiTiet);
            }

            gioHang.NgayCapNhat = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Thêm món vào giỏ hàng thành công"
            });
        }


        // =====================================================
        // PUT: api/GioHang/capnhat
        // Cập nhật số lượng món
        // =====================================================
        [HttpPut("capnhat")]
        public async Task<IActionResult> CapNhatSoLuong(
            int maNguoiDung,
            int maMonAn,
            int soLuong)
        {
            if (soLuong <= 0)
            {
                return BadRequest(new
                {
                    message = "Số lượng phải lớn hơn 0"
                });
            }

            var gioHang = await _context.GioHangs
                .FirstOrDefaultAsync(x => x.MaNguoiDung == maNguoiDung);

            if (gioHang == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy giỏ hàng"
                });
            }

            var chiTiet = await _context.ChiTietGioHangs
                .FirstOrDefaultAsync(x =>
                    x.MaGioHang == gioHang.MaGioHang &&
                    x.MaMonAn == maMonAn);

            if (chiTiet == null)
            {
                return NotFound(new
                {
                    message = "Món ăn không có trong giỏ hàng"
                });
            }

            chiTiet.SoLuong = soLuong;

            gioHang.NgayCapNhat = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật số lượng thành công"
            });
        }


        // =====================================================
        // DELETE: api/GioHang/xoa
        // Xóa một món khỏi giỏ hàng
        // =====================================================
        [HttpDelete("xoa")]
        public async Task<IActionResult> XoaKhoiGioHang(
            int maNguoiDung,
            int maMonAn)
        {
            var gioHang = await _context.GioHangs
                .FirstOrDefaultAsync(x => x.MaNguoiDung == maNguoiDung);

            if (gioHang == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy giỏ hàng"
                });
            }

            var chiTiet = await _context.ChiTietGioHangs
                .FirstOrDefaultAsync(x =>
                    x.MaGioHang == gioHang.MaGioHang &&
                    x.MaMonAn == maMonAn);

            if (chiTiet == null)
            {
                return NotFound(new
                {
                    message = "Món ăn không có trong giỏ hàng"
                });
            }

            _context.ChiTietGioHangs.Remove(chiTiet);

            gioHang.NgayCapNhat = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Xóa món khỏi giỏ hàng thành công"
            });
        }


        // =====================================================
        // DELETE: api/GioHang/xoa-tat-ca/1
        // Xóa toàn bộ giỏ hàng
        // =====================================================
        [HttpDelete("xoa-tat-ca/{maNguoiDung}")]
        public async Task<IActionResult> XoaTatCa(int maNguoiDung)
        {
            var gioHang = await _context.GioHangs
                .FirstOrDefaultAsync(x => x.MaNguoiDung == maNguoiDung);

            if (gioHang == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy giỏ hàng"
                });
            }

            var chiTiet = await _context.ChiTietGioHangs
                .Where(x => x.MaGioHang == gioHang.MaGioHang)
                .ToListAsync();

            if (chiTiet.Count > 0)
            {
                _context.ChiTietGioHangs.RemoveRange(chiTiet);
            }

            gioHang.NgayCapNhat = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đã xóa toàn bộ giỏ hàng"
            });
        }
    }
}