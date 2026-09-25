namespace QL_FOODDELI.Models
{
    public class CuaHang
    {
        public string MaCuaHang { get; set; } = string.Empty;
        public string? MaChuShop { get; set; }
        public string? TenCuaHang { get; set; }
        public string? MoTa { get; set; }
        public string? SoDienThoai { get; set; }
        public string? DiaChi { get; set; }
        public string? AnhCuaHang { get; set; }
        public int? TrangThai { get; set; }
        public DateTime? NgayTao { get; set; }
    }
}
