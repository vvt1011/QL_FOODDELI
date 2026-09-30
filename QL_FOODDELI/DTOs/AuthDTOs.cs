namespace QL_FOODDELI.DTOs
{
    public class DangKyRequest
    {
        public string? HoTen { get; set; }
        public string Email { get; set; } = string.Empty;
        public string MatKhau { get; set; } = string.Empty;
        public string? SoDienThoai { get; set; }
        public string? AnhDaiDien { get; set; }
        public string? MaVaiTro { get; set; } // Optional: Mac dinh la KhachHang
    }

    public class DangNhapRequest
    {
        public string Email { get; set; } = string.Empty;
        public string MatKhau { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public string MaNguoiDung { get; set; } = string.Empty;
        public string? HoTen { get; set; }
        public string? Email { get; set; }
        public string? VaiTro { get; set; }
    }
}
