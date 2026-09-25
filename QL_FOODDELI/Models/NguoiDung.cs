namespace QL_FOODDELI.Models
{
    public class NguoiDung
    {
        public string MaNguoiDung { get; set; } = string.Empty;
        public string? HoTen { get; set; }
        public string? Email { get; set; }
        public string? MatKhau { get; set; }
        public string? SoDienThoai { get; set; }
        public string? AnhDaiDien { get; set; }
        public int? TrangThai { get; set; }
        public DateTime? NgayTao { get; set; }
        public string? TenVaiTro { get; set; }
    }
}
