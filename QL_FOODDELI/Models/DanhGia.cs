namespace QL_FOODDELI.Models
{
    public class DanhGia
    {
        public string MaDanhGia { get; set; } = string.Empty;
        public string? MaNguoiDung { get; set; }
        public string? MaMonAn { get; set; }
        public string? MaDonHang { get; set; }
        public int? SoSao { get; set; }
        public string? NoiDung { get; set; }
        public DateTime? NgayDanhGia { get; set; }
    }
}