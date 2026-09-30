namespace QL_FOODDELI.Models
{
    public class ThanhToan
    {
        public string MaThanhToan { get; set; } = string.Empty;
        public string? MaDonHang { get; set; }
        public string? PhuongThuc { get; set; }
        public double? SoTien { get; set; }
        public string? TrangThai { get; set; }
        public string? MaGiaoDich { get; set; }
        public DateTime? NgayThanhToan { get; set; }
    }
}