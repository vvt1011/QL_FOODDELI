using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QL_FOODDELI.Models;
using QL_FOODDELI.Repositories;
using System.Security.Claims;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CuaHangController : ControllerBase
    {
        private readonly ICuaHangRepository _cuaHangRepo;

        public CuaHangController(ICuaHangRepository cuaHangRepo)
        {
            _cuaHangRepo = cuaHangRepo;
        }

        // =========================
        // GET: api/CuaHang
        // Public
        // =========================
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetCuaHangs()
        {
            var cuaHangs = await _cuaHangRepo.GetAllAsync();
            return Ok(cuaHangs);
        }

        // =========================
        // GET: api/CuaHang/{id}
        // Public
        // =========================
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCuaHang(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest(new { message = "Ma cua hang khong hop le" });

            var cuaHang = await _cuaHangRepo.GetByIdAsync(id);

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
        // =========================
        [HttpPost]
        [Authorize(Roles = "ChuShop,QuanLy,Admin")]
        public async Task<IActionResult> CreateCuaHang(
            [FromBody] CuaHang cuaHang)
        {
            if (cuaHang == null)
            {
                return BadRequest(new
                {
                    message = "Du lieu khong hop le"
                });
            }

            var userId = GetUserId();

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new
                {
                    message = "Khong xac dinh duoc nguoi dung"
                });
            }

            var isChuShop = User.IsInRole("ChuShop");
            var isAdminOrQuanLy =
                User.IsInRole("Admin") ||
                User.IsInRole("QuanLy");

            // ==========================================
            // CHUSHOP:
            // Luon gan MaChuShop = JWT hien tai.
            // Khong cho client tu truyen MaChuShop nguoi khac.
            // ==========================================
            if (isChuShop)
            {
                cuaHang.MaChuShop = userId;
            }
            else if (isAdminOrQuanLy)
            {
                // Admin / QuanLy co the tao cua hang
                // va gan MaChuShop theo body neu can.
                if (string.IsNullOrWhiteSpace(cuaHang.MaChuShop))
                {
                    return BadRequest(new
                    {
                        message = "MaChuShop khong duoc de trong khi Admin/QuanLy tao cua hang"
                    });
                }
            }

            if (string.IsNullOrWhiteSpace(cuaHang.MaCuaHang))
            {
                cuaHang.MaCuaHang =
                    "CH" + Guid.NewGuid().ToString("N")[..10];
            }

            cuaHang.NgayTao = DateTime.Now;

            var success = await _cuaHangRepo.CreateAsync(cuaHang);

            if (!success)
            {
                return BadRequest(new
                {
                    message = "Khong the tao cua hang"
                });
            }

            return Ok(new
            {
                message = "Tao cua hang thanh cong",
                maCuaHang = cuaHang.MaCuaHang
            });
        }

        // =========================
        // PUT: api/CuaHang/{id}
        // =========================
        [HttpPut("{id}")]
        [Authorize(Roles = "ChuShop,QuanLy,Admin")]
        public async Task<IActionResult> UpdateCuaHang(
            string id,
            [FromBody] CuaHang cuaHang)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new
                {
                    message = "Ma cua hang khong hop le"
                });
            }

            if (cuaHang == null)
            {
                return BadRequest(new
                {
                    message = "Du lieu khong hop le"
                });
            }

            var userId = GetUserId();

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new
                {
                    message = "Khong xac dinh duoc nguoi dung"
                });
            }

            // ==========================================
            // Lay cua hang hien tai
            // ==========================================
            var cuaHangHienTai =
                await _cuaHangRepo.GetByIdAsync(id);

            if (cuaHangHienTai == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay cua hang"
                });
            }

            // ==========================================
            // CHUSHOP:
            // Chi duoc sua cua hang cua chinh minh.
            // ==========================================
            if (User.IsInRole("ChuShop"))
            {
                if (!string.Equals(
                        cuaHangHienTai.MaChuShop,
                        userId,
                        StringComparison.OrdinalIgnoreCase))
                {
                    return Forbid();
                }

                // Khong cho ChuShop doi chu cua cua hang
                cuaHang.MaChuShop = cuaHangHienTai.MaChuShop;
            }

            // ==========================================
            // Khong cho phep thay doi MaCuaHang
            // ==========================================
            cuaHang.MaCuaHang = id;

            var success =
                await _cuaHangRepo.UpdateAsync(cuaHang);

            if (!success)
            {
                return NotFound(new
                {
                    message = "Khong tim thay hoac cap nhat that bai"
                });
            }

            return Ok(new
            {
                message = "Cap nhat cua hang thanh cong"
            });
        }

        // =========================
        // DELETE: api/CuaHang/{id}
        // =========================
        [HttpDelete("{id}")]
        [Authorize(Roles = "QuanLy,Admin")]
        public async Task<IActionResult> DeleteCuaHang(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new
                {
                    message = "Ma cua hang khong hop le"
                });
            }

            var cuaHang =
                await _cuaHangRepo.GetByIdAsync(id);

            if (cuaHang == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay cua hang de xoa"
                });
            }

            var success =
                await _cuaHangRepo.DeleteAsync(id);

            if (!success)
            {
                return BadRequest(new
                {
                    message = "Khong the xoa cua hang"
                });
            }

            return Ok(new
            {
                message = "Xoa cua hang thanh cong"
            });
        }

        // =========================
        // GET USER ID FROM JWT
        // =========================
        private string? GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("MaNguoiDung")?.Value;
        }
    }
}