using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QL_FOODDELI.Models;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DanhGiaController : ControllerBase
    {
        private readonly QLFoodDeliContext _context;

        public DanhGiaController(QLFoodDeliContext context)
        {
            _context = context;
        }

        // GET: api/DanhGia
        [HttpGet]
        public async Task<IActionResult> GetDanhGias()
        {
            var danhGias = await _context.DanhGia
                .AsNoTracking()
                .ToListAsync();

            return Ok(danhGias);
        }

        // GET: api/DanhGia/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDanhGia(int id)
        {
            var danhGia = await _context.DanhGia
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.MaDanhGia == id);

            if (danhGia == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay danh gia"
                });
            }

            return Ok(danhGia);
        }

        // POST: api/DanhGia
        [HttpPost]
        public async Task<IActionResult> CreateDanhGia(DanhGia danhGia)
        {
            if (danhGia == null)
            {
                return BadRequest(new
                {
                    message = "Du lieu khong hop le"
                });
            }

            danhGia.MaDanhGia = 0;
            danhGia.NgayDanhGia = DateTime.Now;

            _context.DanhGia.Add(danhGia);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetDanhGia),
                new { id = danhGia.MaDanhGia },
                danhGia
            );
        }

        // PUT: api/DanhGia/1
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDanhGia(
            int id,
            DanhGia danhGia)
        {
            if (id != danhGia.MaDanhGia)
            {
                return BadRequest(new
                {
                    message = "Ma danh gia khong khop"
                });
            }

            var danhGiaCu = await _context.DanhGia
                .FirstOrDefaultAsync(x => x.MaDanhGia == id);

            if (danhGiaCu == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay danh gia"
                });
            }

            danhGiaCu.MaNguoiDung = danhGia.MaNguoiDung;
            danhGiaCu.MaDonHang = danhGia.MaDonHang;
            danhGiaCu.MaMonAn = danhGia.MaMonAn;
            danhGiaCu.MaCuaHang = danhGia.MaCuaHang;
            danhGiaCu.SoSao = danhGia.SoSao;
            danhGiaCu.BinhLuan = danhGia.BinhLuan;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cap nhat danh gia thanh cong",
                data = danhGiaCu
            });
        }

        // DELETE: api/DanhGia/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDanhGia(int id)
        {
            var danhGia = await _context.DanhGia
                .FirstOrDefaultAsync(x => x.MaDanhGia == id);

            if (danhGia == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay danh gia"
                });
            }

            _context.DanhGia.Remove(danhGia);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Xoa danh gia thanh cong"
            });
        }
    }
}