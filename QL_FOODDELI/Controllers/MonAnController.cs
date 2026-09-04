using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QL_FOODDELI.Models;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MonAnController : ControllerBase
    {
        private readonly QLFoodDeliContext _context;

        public MonAnController(QLFoodDeliContext context)
        {
            _context = context;
        }

        // GET: api/MonAn
        [HttpGet]
        public async Task<IActionResult> GetMonAns()
        {
            var monAns = await _context.MonAns
                .AsNoTracking()
                .ToListAsync();

            return Ok(monAns);
        }

        // GET: api/MonAn/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMonAn(int id)
        {
            var monAn = await _context.MonAns
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.MaMonAn == id);

            if (monAn == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay mon an"
                });
            }

            return Ok(monAn);
        }

        // GET: api/MonAn/DanhMuc/1
        [HttpGet("DanhMuc/{maDanhMuc}")]
        public async Task<IActionResult> GetMonAnTheoDanhMuc(int maDanhMuc)
        {
            var monAns = await _context.MonAns
                .AsNoTracking()
                .Where(x => x.MaDanhMuc == maDanhMuc)
                .ToListAsync();

            return Ok(monAns);
        }

        // GET: api/MonAn/CuaHang/1
        [HttpGet("CuaHang/{maCuaHang}")]
        public async Task<IActionResult> GetMonAnTheoCuaHang(int maCuaHang)
        {
            var monAns = await _context.MonAns
                .AsNoTracking()
                .Where(x => x.MaCuaHang == maCuaHang)
                .ToListAsync();

            return Ok(monAns);
        }

        // POST: api/MonAn
        [HttpPost]
        public async Task<IActionResult> CreateMonAn(MonAn monAn)
        {
            if (monAn == null)
            {
                return BadRequest(new
                {
                    message = "Du lieu khong hop le"
                });
            }

            // Kiem tra cua hang
            var cuaHangTonTai = await _context.CuaHangs
                .AnyAsync(x => x.MaCuaHang == monAn.MaCuaHang);

            if (!cuaHangTonTai)
            {
                return BadRequest(new
                {
                    message = "Cua hang khong ton tai"
                });
            }

            // Kiem tra danh muc
            var danhMucTonTai = await _context.DanhMucs
                .AnyAsync(x => x.MaDanhMuc == monAn.MaDanhMuc);

            if (!danhMucTonTai)
            {
                return BadRequest(new
                {
                    message = "Danh muc khong ton tai"
                });
            }

            monAn.MaMonAn = 0;
            monAn.NgayTao = DateTime.Now;

            _context.MonAns.Add(monAn);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetMonAn),
                new { id = monAn.MaMonAn },
                monAn
            );
        }

        // PUT: api/MonAn/1
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMonAn(
            int id,
            MonAn monAn)
        {
            if (id != monAn.MaMonAn)
            {
                return BadRequest(new
                {
                    message = "Ma mon an khong khop"
                });
            }

            var monAnCu = await _context.MonAns
                .FirstOrDefaultAsync(x => x.MaMonAn == id);

            if (monAnCu == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay mon an"
                });
            }

            // Kiem tra cua hang
            var cuaHangTonTai = await _context.CuaHangs
                .AnyAsync(x => x.MaCuaHang == monAn.MaCuaHang);

            if (!cuaHangTonTai)
            {
                return BadRequest(new
                {
                    message = "Cua hang khong ton tai"
                });
            }

            // Kiem tra danh muc
            var danhMucTonTai = await _context.DanhMucs
                .AnyAsync(x => x.MaDanhMuc == monAn.MaDanhMuc);

            if (!danhMucTonTai)
            {
                return BadRequest(new
                {
                    message = "Danh muc khong ton tai"
                });
            }

            monAnCu.MaCuaHang = monAn.MaCuaHang;
            monAnCu.MaDanhMuc = monAn.MaDanhMuc;
            monAnCu.TenMonAn = monAn.TenMonAn;
            monAnCu.MoTa = monAn.MoTa;
            monAnCu.Gia = monAn.Gia;
            monAnCu.AnhMonAn = monAn.AnhMonAn;
            monAnCu.DanhGia = monAn.DanhGia;
            monAnCu.TrangThai = monAn.TrangThai;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cap nhat mon an thanh cong",
                data = monAnCu
            });
        }

        // DELETE: api/MonAn/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMonAn(int id)
        {
            var monAn = await _context.MonAns
                .FirstOrDefaultAsync(x => x.MaMonAn == id);

            if (monAn == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay mon an"
                });
            }

            _context.MonAns.Remove(monAn);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Xoa mon an thanh cong"
            });
        }
    }
}
