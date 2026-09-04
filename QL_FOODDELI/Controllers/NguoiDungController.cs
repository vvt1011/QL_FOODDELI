using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QL_FOODDELI.Models;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NguoiDungController : ControllerBase
    {
        private readonly QLFoodDeliContext _context;

        public NguoiDungController(QLFoodDeliContext context)
        {
            _context = context;
        }

        // GET: api/NguoiDung
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NguoiDung>>> GetNguoiDung()
        {
            return await _context.NguoiDungs
                .ToListAsync();
        }

        // GET: api/NguoiDung/1
        [HttpGet("{id}")]
        public async Task<ActionResult<NguoiDung>> GetNguoiDung(int id)
        {
            var nguoiDung = await _context.NguoiDungs
                .FirstOrDefaultAsync(x => x.MaNguoiDung == id);

            if (nguoiDung == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy người dùng"
                });
            }

            return nguoiDung;
        }

        // GET: api/NguoiDung/Email?email=abc@gmail.com
        [HttpGet("Email")]
        public async Task<ActionResult<NguoiDung>> GetTheoEmail(
            [FromQuery] string email)
        {
            var nguoiDung = await _context.NguoiDungs
                .FirstOrDefaultAsync(x => x.Email == email);

            if (nguoiDung == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy người dùng với email này"
                });
            }

            return nguoiDung;
        }

        // POST: api/NguoiDung
        [HttpPost]
        public async Task<ActionResult<NguoiDung>> ThemNguoiDung(
            NguoiDung nguoiDung)
        {
            // Kiểm tra email đã tồn tại
            var emailTonTai = await _context.NguoiDungs
                .AnyAsync(x => x.Email == nguoiDung.Email);

            if (emailTonTai)
            {
                return BadRequest(new
                {
                    message = "Email đã tồn tại"
                });
            }

            _context.NguoiDungs.Add(nguoiDung);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetNguoiDung),
                new { id = nguoiDung.MaNguoiDung },
                nguoiDung
            );
        }

        // PUT: api/NguoiDung/1
        [HttpPut("{id}")]
        public async Task<IActionResult> SuaNguoiDung(
            int id,
            NguoiDung nguoiDung)
        {
            if (id != nguoiDung.MaNguoiDung)
            {
                return BadRequest(new
                {
                    message = "Mã người dùng không khớp"
                });
            }

            var nguoiDungCu = await _context.NguoiDungs
                .FindAsync(id);

            if (nguoiDungCu == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy người dùng"
                });
            }

            nguoiDungCu.HoTen = nguoiDung.HoTen;
            nguoiDungCu.Email = nguoiDung.Email;
            nguoiDungCu.SoDienThoai = nguoiDung.SoDienThoai;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật người dùng thành công",
                data = nguoiDungCu
            });
        }

        // DELETE: api/NguoiDung/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> XoaNguoiDung(int id)
        {
            var nguoiDung = await _context.NguoiDungs
                .FindAsync(id);

            if (nguoiDung == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy người dùng"
                });
            }

            _context.NguoiDungs.Remove(nguoiDung);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Xóa người dùng thành công"
            });
        }
    }
}
