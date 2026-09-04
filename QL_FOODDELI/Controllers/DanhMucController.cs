using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QL_FOODDELI.Models;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DanhMucController : ControllerBase
    {
        private readonly QLFoodDeliContext _context;

        public DanhMucController(QLFoodDeliContext context)
        {
            _context = context;
        }

        // GET: api/DanhMuc
        [HttpGet]
        public async Task<IActionResult> GetDanhMucs()
        {
            var danhMucs = await _context.DanhMucs
                .AsNoTracking()
                .ToListAsync();

            return Ok(danhMucs);
        }

        // GET: api/DanhMuc/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDanhMuc(int id)
        {
            var danhMuc = await _context.DanhMucs
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.MaDanhMuc == id);

            if (danhMuc == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay danh muc"
                });
            }

            return Ok(danhMuc);
        }

        // POST: api/DanhMuc
        [HttpPost]
        public async Task<IActionResult> CreateDanhMuc(DanhMuc danhMuc)
        {
            if (danhMuc == null)
            {
                return BadRequest(new
                {
                    message = "Du lieu khong hop le"
                });
            }

            danhMuc.MaDanhMuc = 0;

            _context.DanhMucs.Add(danhMuc);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetDanhMuc),
                new { id = danhMuc.MaDanhMuc },
                danhMuc
            );
        }

        // PUT: api/DanhMuc/1
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDanhMuc(
            int id,
            DanhMuc danhMuc)
        {
            if (id != danhMuc.MaDanhMuc)
            {
                return BadRequest(new
                {
                    message = "Ma danh muc khong khop"
                });
            }

            var danhMucCu = await _context.DanhMucs
                .FirstOrDefaultAsync(x => x.MaDanhMuc == id);

            if (danhMucCu == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay danh muc"
                });
            }

            danhMucCu.TenDanhMuc = danhMuc.TenDanhMuc;
            danhMucCu.MoTa = danhMuc.MoTa;
            danhMucCu.AnhDanhMuc = danhMuc.AnhDanhMuc;
            danhMucCu.TrangThai = danhMuc.TrangThai;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cap nhat danh muc thanh cong",
                data = danhMucCu
            });
        }

        // DELETE: api/DanhMuc/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDanhMuc(int id)
        {
            var danhMuc = await _context.DanhMucs
                .FirstOrDefaultAsync(x => x.MaDanhMuc == id);

            if (danhMuc == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay danh muc"
                });
            }

            _context.DanhMucs.Remove(danhMuc);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Xoa danh muc thanh cong"
            });
        }
    }
}