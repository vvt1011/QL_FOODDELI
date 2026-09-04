using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QL_FOODDELI.Models;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CuaHangController : ControllerBase
    {
        private readonly QLFoodDeliContext _context;

        public CuaHangController(QLFoodDeliContext context)
        {
            _context = context;
        }

        // =========================
        // GET: api/CuaHang
        // Lay danh sach cua hang
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetCuaHangs()
        {
            var cuaHangs = await _context.CuaHangs
                .AsNoTracking()
                .ToListAsync();

            return Ok(cuaHangs);
        }

        // =========================
        // GET: api/CuaHang/1
        // Lay 1 cua hang
        // =========================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCuaHang(int id)
        {
            var cuaHang = await _context.CuaHangs
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.MaCuaHang == id);

            if (cuaHang == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay cua hang"
                });
            }

            return Ok(cuaHang);
        }

        // =========================
        // POST: api/CuaHang
        // Them cua hang
        // =========================
        [HttpPost]
        public async Task<IActionResult> CreateCuaHang(CuaHang cuaHang)
        {
            if (cuaHang == null)
            {
                return BadRequest(new
                {
                    message = "Du lieu khong hop le"
                });
            }

            cuaHang.MaCuaHang = 0;
            cuaHang.NgayTao = DateTime.Now;

            _context.CuaHangs.Add(cuaHang);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetCuaHang),
                new { id = cuaHang.MaCuaHang },
                cuaHang
            );
        }

        // =========================
        // PUT: api/CuaHang/1
        // Sua cua hang
        // =========================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCuaHang(
            int id,
            CuaHang cuaHang)
        {
            if (id != cuaHang.MaCuaHang)
            {
                return BadRequest(new
                {
                    message = "Ma cua hang khong khop"
                });
            }

            var cuaHangCu = await _context.CuaHangs
                .FirstOrDefaultAsync(x => x.MaCuaHang == id);

            if (cuaHangCu == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay cua hang"
                });
            }

            cuaHangCu.MaChuShop = cuaHang.MaChuShop;
            cuaHangCu.TenCuaHang = cuaHang.TenCuaHang;
            cuaHangCu.MoTa = cuaHang.MoTa;
            cuaHangCu.SoDienThoai = cuaHang.SoDienThoai;
            cuaHangCu.DiaChi = cuaHang.DiaChi;
            cuaHangCu.AnhCuaHang = cuaHang.AnhCuaHang;
            cuaHangCu.TrangThai = cuaHang.TrangThai;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cap nhat cua hang thanh cong",
                data = cuaHangCu
            });
        }

        // =========================
        // DELETE: api/CuaHang/1
        // Xoa cua hang
        // =========================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCuaHang(int id)
        {
            var cuaHang = await _context.CuaHangs
                .FirstOrDefaultAsync(x => x.MaCuaHang == id);

            if (cuaHang == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay cua hang"
                });
            }

            _context.CuaHangs.Remove(cuaHang);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Xoa cua hang thanh cong"
            });
        }
    }
}