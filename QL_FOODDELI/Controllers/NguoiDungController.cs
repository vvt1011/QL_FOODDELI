using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QL_FOODDELI.Repositories;
using System.Security.Claims;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NguoiDungController : ControllerBase
    {
        private readonly INguoiDungRepository _nguoiDungRepo;

        public NguoiDungController(INguoiDungRepository nguoiDungRepo)
        {
            _nguoiDungRepo = nguoiDungRepo;
        }

        // GET: api/NguoiDung
        [HttpGet]
        [Authorize(Roles = "QuanLy,Admin")]
        public async Task<IActionResult> GetNguoiDungs()
        {
            var users = await _nguoiDungRepo.GetAllAsync();
            return Ok(users);
        }

        // GET: api/NguoiDung/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetNguoiDung(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("MaNguoiDung")?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Chua xac dinh nguoi dung" });

            var isAdminOrQuanLy =
                User.IsInRole("Admin") ||
                User.IsInRole("QuanLy");

            if (!isAdminOrQuanLy && userId != id)
            {
                return Forbid();
            }

            var user = await _nguoiDungRepo.GetByIdAsync(id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay nguoi dung"
                });
            }

            return Ok(user);
        }

        // GET: api/NguoiDung/Email?email=abc@gmail.com
        [HttpGet("Email")]
        [Authorize(Roles = "QuanLy,Admin")]
        public async Task<IActionResult> GetTheoEmail([FromQuery] string email)
        {
            var user = await _nguoiDungRepo.GetByEmailAsync(email);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay nguoi dung voi email nay"
                });
            }

            return Ok(user);
        }
    }
}