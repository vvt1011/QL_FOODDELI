using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QL_FOODDELI.DTOs;
using QL_FOODDELI.Models;
using QL_FOODDELI.Repositories;
using System.Security.Claims;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MonAnController : ControllerBase
    {
        private readonly IMonAnRepository _monAnRepo;
        private readonly ICuaHangRepository _cuaHangRepo;

        public MonAnController(
            IMonAnRepository monAnRepo,
            ICuaHangRepository cuaHangRepo)
        {
            _monAnRepo = monAnRepo;
            _cuaHangRepo = cuaHangRepo;
        }

        // ==========================================
        // POST: api/MonAn/search
        // Public
        // ==========================================
        [HttpPost("search")]
        [AllowAnonymous]
        public async Task<IActionResult> Search(
            [FromBody] MonAnSearchRequest request)
        {
            if (request == null)
            {
                return BadRequest(new
                {
                    message = "Du lieu khong hop le"
                });
            }

            var result = await _monAnRepo.SearchAsync(request);

            return Ok(result);
        }

        // ==========================================
        // GET: api/MonAn
        // Public
        // ==========================================
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetMonAns()
        {
            var monAns = await _monAnRepo.GetAllAsync();

            return Ok(monAns);
        }

        // ==========================================
        // GET: api/MonAn/{id}
        // Public
        // ==========================================
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetMonAn(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new
                {
                    message = "Ma mon an khong hop le"
                });
            }

            var monAn = await _monAnRepo.GetByIdAsync(id);

            if (monAn == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay mon an"
                });
            }

            return Ok(monAn);
        }

        // ==========================================
        // GET: api/MonAn/CuaHang/{maCuaHang}
        // Public
        // ==========================================
        [HttpGet("CuaHang/{maCuaHang}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetMonAnTheoCuaHang(
            string maCuaHang)
        {
            if (string.IsNullOrWhiteSpace(maCuaHang))
            {
                return BadRequest(new
                {
                    message = "Ma cua hang khong hop le"
                });
            }

            var monAns =
                await _monAnRepo.GetByCuaHangAsync(maCuaHang);

            return Ok(monAns);
        }

        // ==========================================
        // POST: api/MonAn
        // ==========================================
        [HttpPost]
        [Authorize(Roles = "ChuShop,QuanLy,Admin")]
        public async Task<IActionResult> CreateMonAn(
            [FromBody] MonAn monAn)
        {
            if (monAn == null)
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
            // Kiem tra MaCuaHang
            // ==========================================
            if (string.IsNullOrWhiteSpace(monAn.MaCuaHang))
            {
                return BadRequest(new
                {
                    message = "MaCuaHang khong duoc de trong"
                });
            }

            var cuaHang =
                await _cuaHangRepo.GetByIdAsync(monAn.MaCuaHang);

            if (cuaHang == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay cua hang"
                });
            }

            // ==========================================
            // CHUSHOP:
            // Chi duoc tao mon trong cua hang cua minh
            // ==========================================
            if (User.IsInRole("ChuShop"))
            {
                if (!string.Equals(
                        cuaHang.MaChuShop,
                        userId,
                        StringComparison.OrdinalIgnoreCase))
                {
                    return Forbid();
                }
            }

            if (string.IsNullOrWhiteSpace(monAn.MaMonAn))
            {
                monAn.MaMonAn =
                    "MA" + Guid.NewGuid().ToString("N")[..10];
            }

            monAn.NgayTao = DateTime.Now;

            var success =
                await _monAnRepo.CreateAsync(monAn);

            if (!success)
            {
                return BadRequest(new
                {
                    message = "Khong the tao mon an"
                });
            }

            return Ok(new
            {
                message = "Tao mon an thanh cong",
                maMonAn = monAn.MaMonAn
            });
        }

        // ==========================================
        // PUT: api/MonAn/{id}
        // ==========================================
        [HttpPut("{id}")]
        [Authorize(Roles = "ChuShop,QuanLy,Admin")]
        public async Task<IActionResult> UpdateMonAn(
            string id,
            [FromBody] MonAn monAn)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new
                {
                    message = "Ma mon an khong hop le"
                });
            }

            if (monAn == null)
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
            // Lay mon an hien tai
            // ==========================================
            var monAnHienTai =
                await _monAnRepo.GetByIdAsync(id);

            if (monAnHienTai == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay mon an"
                });
            }

            // ==========================================
            // CHUSHOP:
            // Chi duoc sua mon thuoc cua hang cua minh
            // ==========================================
            if (User.IsInRole("ChuShop"))
            {
                if (string.IsNullOrWhiteSpace(
                        monAnHienTai.MaCuaHang))
                {
                    return Forbid();
                }

                var cuaHang =
                    await _cuaHangRepo.GetByIdAsync(
                        monAnHienTai.MaCuaHang);

                if (cuaHang == null)
                {
                    return NotFound(new
                    {
                        message = "Khong tim thay cua hang cua mon an"
                    });
                }

                if (!string.Equals(
                        cuaHang.MaChuShop,
                        userId,
                        StringComparison.OrdinalIgnoreCase))
                {
                    return Forbid();
                }
            }

            // ==========================================
            // Khong cho thay doi MaMonAn
            // ==========================================
            monAn.MaMonAn = id;

            // ==========================================
            // ChuShop khong duoc chuyen mon sang
            // cua hang khac
            // ==========================================
            if (User.IsInRole("ChuShop"))
            {
                monAn.MaCuaHang = monAnHienTai.MaCuaHang;
            }

            var success =
                await _monAnRepo.UpdateAsync(monAn);

            if (!success)
            {
                return NotFound(new
                {
                    message = "Khong tim thay hoac cap nhat that bai"
                });
            }

            return Ok(new
            {
                message = "Cap nhat mon an thanh cong"
            });
        }

        // ==========================================
        // DELETE: api/MonAn/{id}
        // ==========================================
        [HttpDelete("{id}")]
        [Authorize(Roles = "ChuShop,QuanLy,Admin")]
        public async Task<IActionResult> DeleteMonAn(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new
                {
                    message = "Ma mon an khong hop le"
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
            // Lay mon an hien tai
            // ==========================================
            var monAn =
                await _monAnRepo.GetByIdAsync(id);

            if (monAn == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay mon an de xoa"
                });
            }

            // ==========================================
            // CHUSHOP:
            // Chi duoc xoa mon cua cua hang cua minh
            // ==========================================
            if (User.IsInRole("ChuShop"))
            {
                if (string.IsNullOrWhiteSpace(monAn.MaCuaHang))
                {
                    return Forbid();
                }

                var cuaHang =
                    await _cuaHangRepo.GetByIdAsync(
                        monAn.MaCuaHang);

                if (cuaHang == null)
                {
                    return NotFound(new
                    {
                        message = "Khong tim thay cua hang cua mon an"
                    });
                }

                if (!string.Equals(
                        cuaHang.MaChuShop,
                        userId,
                        StringComparison.OrdinalIgnoreCase))
                {
                    return Forbid();
                }
            }

            var success =
                await _monAnRepo.DeleteAsync(id);

            if (!success)
            {
                return NotFound(new
                {
                    message = "Khong tim thay mon an de xoa"
                });
            }

            return Ok(new
            {
                message = "Da ngung ban mon an thanh cong"
            });
        }

        // ==========================================
        // GET USER ID FROM JWT
        // ==========================================
        private string? GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("MaNguoiDung")?.Value;
        }
    }
}