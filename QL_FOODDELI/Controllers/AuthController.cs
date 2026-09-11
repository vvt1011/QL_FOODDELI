using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QL_FOODDELI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly QLFoodDeliContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(
            QLFoodDeliContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }


        // =========================
        // DANG KY
        // =========================
        [HttpPost("dang-ky")]
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

            var daTonTai = await _context.NguoiDungs
                .AnyAsync(x => x.Email == request.Email);

            if (daTonTai)
            {
                return BadRequest(new
                {
                    message = "Email da ton tai"
                });
            }

            var nguoiDung = new NguoiDung
            {
                HoTen = request.HoTen,
                Email = request.Email,
                MatKhau = request.MatKhau,
                SoDienThoai = request.SoDienThoai,
                AnhDaiDien = request.AnhDaiDien,
                TrangThai = true,
                NgayTao = DateTime.Now
            };

            _context.NguoiDungs.Add(nguoiDung);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Dang ky thanh cong",
                maNguoiDung = nguoiDung.MaNguoiDung,
                hoTen = nguoiDung.HoTen,
                email = nguoiDung.Email
            });
        }

        // =========================
        // DANG NHAP
        // =========================
        [HttpPost("dang-nhap")]
        public async Task<IActionResult> DangNhap(
            [FromBody] DangNhapRequest request)
        {
            if (request == null)
                return BadRequest(new { message = "Du lieu khong hop le" });

            var user = await _context.NguoiDungs
                .Include(x => x.MaVaiTros)
                .FirstOrDefaultAsync(x =>
                    x.Email == request.Email &&
                    x.MatKhau == request.MatKhau);

            if (user == null)
            {
                return Unauthorized(new
                {
                    message = "Email hoac mat khau khong dung"
                });
            }

            if (!user.TrangThai)
            {
                return Unauthorized(new
                {
                    message = "Tai khoan da bi khoa"
                });
            }

            // Lay danh sach role
            var roles = user.MaVaiTros
                .Select(x => x.TenVaiTro)
                .ToList();

            // Tao Claims
            var claims = new List<Claim>
    {
        new Claim(
            ClaimTypes.NameIdentifier,
            user.MaNguoiDung.ToString()
        ),

        new Claim(
            ClaimTypes.Name,
            user.HoTen
        ),

        new Claim(
            ClaimTypes.Email,
            user.Email
        )
    };

            // Them Role vao Claims
            foreach (var role in roles)
            {
                claims.Add(
                    new Claim(ClaimTypes.Role, role)
                );
            }

            // Lay cau hinh JWT
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _configuration["Jwt:Key"]!
                )
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            // Tao Token
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler()
                .WriteToken(token);

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
        // =========================
        // REQUEST DANG KY
        // =========================
        public class DangKyRequest
        {
            public string HoTen { get; set; } = null!;

            public string Email { get; set; } = null!;

            public string MatKhau { get; set; } = null!;

            public string? SoDienThoai { get; set; }

            public string? AnhDaiDien { get; set; }
        }

        // =========================
        // REQUEST DANG NHAP
        // =========================
        public class DangNhapRequest
        {
            public string Email { get; set; } = null!;

            public string MatKhau { get; set; } = null!;
        }
    }
}