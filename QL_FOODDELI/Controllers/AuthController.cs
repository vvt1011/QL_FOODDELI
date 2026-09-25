using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using QL_FOODDELI.DTOs;
using QL_FOODDELI.Models;
using QL_FOODDELI.Repositories;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly INguoiDungRepository _nguoiDungRepo;
        private readonly IConfiguration _configuration;

        public AuthController(
            INguoiDungRepository nguoiDungRepo,
            IConfiguration configuration)
        {
            _nguoiDungRepo = nguoiDungRepo;
            _configuration = configuration;
        }

        // =========================
        // POST: api/Auth/dang-ky (or /register)
        // =========================
        [HttpPost("dang-ky")]
        [HttpPost("register")]
        public async Task<IActionResult> DangKy([FromBody] DangKyRequest request)
        {
            if (request == null)
                return BadRequest(new { message = "Du lieu khong hop le" });

            if (string.IsNullOrWhiteSpace(request.HoTen))
                return BadRequest(new { message = "Ho ten khong duoc de trong" });

            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest(new { message = "Email khong duoc de trong" });

            if (string.IsNullOrWhiteSpace(request.MatKhau))
                return BadRequest(new { message = "Mat khau khong duoc de trong" });

            var daTonTai = await _nguoiDungRepo.ExistsEmailAsync(request.Email);
            if (daTonTai)
            {
                return BadRequest(new { message = "Email da ton tai" });
            }

            var maNguoiDung = "ND" + Guid.NewGuid().ToString("N")[..10];
            var nguoiDung = new NguoiDung
            {
                MaNguoiDung = maNguoiDung,
                HoTen = request.HoTen,
                Email = request.Email,
                MatKhau = request.MatKhau,
                SoDienThoai = request.SoDienThoai,
                AnhDaiDien = request.AnhDaiDien,
                TrangThai = 1,
                NgayTao = DateTime.Now
            };

            var vaiTro = string.IsNullOrEmpty(request.MaVaiTro)
                ? "KhachHang"
                : request.MaVaiTro;

            await _nguoiDungRepo.CreateAsync(nguoiDung, vaiTro);

            return Ok(new
            {
                message = "Dang ky thanh cong",
                maNguoiDung = nguoiDung.MaNguoiDung,
                hoTen = nguoiDung.HoTen,
                email = nguoiDung.Email
            });
        }

        // =========================
        // POST: api/Auth/dang-nhap (or /login)
        // =========================
        [HttpPost("dang-nhap")]
        [HttpPost("login")]
        public async Task<IActionResult> DangNhap([FromBody] DangNhapRequest request)
        {
            if (request == null)
                return BadRequest(new { message = "Du lieu khong hop le" });

            var user = await _nguoiDungRepo.GetByEmailAsync(request.Email);
            if (user == null || user.MatKhau != request.MatKhau)
            {
                return Unauthorized(new { message = "Email hoac mat khau khong dung" });
            }

            if (user.TrangThai == 0)
            {
                return Unauthorized(new { message = "Tai khoan da bi khoa" });
            }

            var roles = (await _nguoiDungRepo.GetRolesByUserIdAsync(user.MaNguoiDung)).ToList();
            if (roles.Count == 0 && !string.IsNullOrEmpty(user.TenVaiTro))
            {
                roles.Add(user.TenVaiTro);
            }

           

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.MaNguoiDung),
                new Claim(JwtRegisteredClaimNames.Sub, user.MaNguoiDung),
                new Claim("nameid", user.MaNguoiDung),
                new Claim("id", user.MaNguoiDung),
                new Claim("MaNguoiDung", user.MaNguoiDung),
                new Claim(ClaimTypes.Name, user.HoTen ?? string.Empty),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty)
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim("role", role));
            }

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)
            );

            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(4),
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                message = "Dang nhap thanh cong",
                token = tokenString,
                maNguoiDung = user.MaNguoiDung,
                hoTen = user.HoTen,
                email = user.Email,
                vaiTro = roles
            });
        }
    }
}