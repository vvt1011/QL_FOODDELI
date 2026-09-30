using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QL_FOODDELI.Repositories;
using System.Security.Claims;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GioHangController : ControllerBase
    {
        private readonly IGioHangRepository _gioHangRepo;

        public GioHangController(IGioHangRepository gioHangRepo)
        {
            _gioHangRepo = gioHangRepo;
        }

        private string? GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("MaNguoiDung")?.Value;
        }
        // =====================================================
        // GET: api/GioHang
        // =====================================================
        [HttpGet]
        public async Task<IActionResult> GetGioHang()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung" });

            var gioHang = await _gioHangRepo.GetByNguoiDungAsync(userId);
            return Ok(gioHang);
        }

        // =====================================================
        // POST: api/GioHang/them-mon
        // =====================================================
        [HttpPost("them-mon")]
        public async Task<IActionResult> ThemMon([FromBody] ThemMonRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.MaMonAn) || request.SoLuong <= 0)
                return BadRequest(new { message = "Thong tin mon an khong hop le" });

            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung" });

            var success = await _gioHangRepo.AddItemAsync(userId, request.MaMonAn, request.SoLuong);
            if (!success)
                return BadRequest(new { message = "Them mon that bai hoac mon khong ton tai" });

            return Ok(new { message = "Them vao gio hang thanh cong" });
        }

        // =====================================================
        // PUT: api/GioHang/cap-nhat-so-luong
        // =====================================================
        [HttpPut("cap-nhat-so-luong")]
        public async Task<IActionResult> CapNhatSoLuong([FromBody] CapNhatSoLuongRequest request)
        {
            if (request == null ||
                string.IsNullOrEmpty(request.MaChiTietGioHang) ||
                request.SoLuong <= 0) return BadRequest(new { message = "Du lieu khong hop le" });

            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung" });

            var success = await _gioHangRepo.UpdateItemQuantityAsync(
                userId,
                request.MaChiTietGioHang,
                request.SoLuong);

            if (!success)
                return BadRequest(new { message = "Cap nhat so luong that bai hoac mon khong ton tai" });

            return Ok(new { message = "Cap nhat so luong thanh cong" });
        }

        // =====================================================
        // DELETE: api/GioHang/xoa-mon/{id}
        // =====================================================
        [HttpDelete("xoa-mon/{id}")]
        public async Task<IActionResult> XoaMon(string id)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung" });

            var success = await _gioHangRepo.RemoveItemAsync(
                userId,
                id);

            if (!success)
                return BadRequest(new { message = "Xoa mon that bai hoac mon khong ton tai" });

            return Ok(new { message = "Xoa mon thanh cong" });
        }

        // =====================================================
        // DELETE: api/GioHang/xoa-het
        // =====================================================
        [HttpDelete("xoa-het")]
        public async Task<IActionResult> XoaHet()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung" });

            await _gioHangRepo.ClearGioHangAsync(userId);
            return Ok(new { message = "Da xoa toan bo gio hang" });
        }

        public class ThemMonRequest
        {
            public string MaMonAn { get; set; } = string.Empty;
            public int SoLuong { get; set; } = 1;
        }

        public class CapNhatSoLuongRequest
        {
            public string MaChiTietGioHang { get; set; } = string.Empty;
            public int SoLuong { get; set; }
        }
    }
}