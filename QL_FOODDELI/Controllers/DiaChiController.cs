using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QL_FOODDELI.DTOs;
using QL_FOODDELI.Repositories;
using System.Security.Claims;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Bắt buộc đăng nhập lấy JWT Token
    public class DiaChiController : ControllerBase
    {
        private readonly IDiaChiRepository _diaChiRepo;

        public DiaChiController(IDiaChiRepository diaChiRepo)
        {
            _diaChiRepo = diaChiRepo;
        }

        // GET: api/DiaChi/cua-toi
        [HttpGet("cua-toi")]
        public async Task<IActionResult> GetCuaToi()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("MaNguoiDung")?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Chưa xác định người dùng" });

            var list = await _diaChiRepo.GetByNguoiDungAsync(userId);
            return Ok(list);
        }

        // POST: api/DiaChi
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DiaChiCreateRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("MaNguoiDung")?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Chưa xác định người dùng" });

            var maDiaChi = await _diaChiRepo.CreateAsync(userId, request);
            return Ok(new { message = "Thêm địa chỉ thành công", maDiaChi });
        }

        // PUT: api/DiaChi
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] DiaChiUpdateRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("MaNguoiDung")?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Chưa xác định người dùng" });

            var success = await _diaChiRepo.UpdateAsync(userId, request);
            if (!success)
                return BadRequest(new { message = "Cập nhật địa chỉ thất bại" });

            return Ok(new { message = "Cập nhật địa chỉ thành công" });
        }

        // PUT: api/DiaChi/{maDiaChi}/mac-dinh
        [HttpPut("{maDiaChi}/mac-dinh")]
        public async Task<IActionResult> SetMacDinh(string maDiaChi)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("MaNguoiDung")?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Chưa xác định người dùng" });

            var success = await _diaChiRepo.SetMacDinhAsync(userId, maDiaChi);
            if (!success)
                return BadRequest(new { message = "Đặt địa chỉ mặc định thất bại" });

            return Ok(new { message = "Đã đặt làm địa chỉ mặc định" });
        }

        // DELETE: api/DiaChi/{maDiaChi}
        [HttpDelete("{maDiaChi}")]
        public async Task<IActionResult> Delete(string maDiaChi)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("MaNguoiDung")?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung" });

            var success = await _diaChiRepo.DeleteAsync(
                userId,
                maDiaChi);

            if (!success)
                return NotFound(new { message = "Khong tim thay dia chi" });

            return Ok(new { message = "Xoa dia chi thanh cong" });
        }
    }
}