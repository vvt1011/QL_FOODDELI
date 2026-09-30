namespace QL_FOODDELI.Models
{
    public class ChiTietGioHang
    {
        public string MaChiTietGioHang { get; set; } = string.Empty;
        public string? MaGioHang { get; set; }
        public string? MaMonAn { get; set; }
        public string? TenMonAn { get; set; }
        public string? AnhMonAn { get; set; }
        public int? SoLuong { get; set; }
        public double? Gia { get; set; }
    }
}
