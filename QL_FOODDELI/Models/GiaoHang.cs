namespace QL_FOODDELI.Models
{
    public class GiaoHang
    {
        public string MaGiaoHang { get; set; } = string.Empty;
        public string? MaDonHang { get; set; }
        public string? MaNguoiGiaoHang { get; set; }
        public string? TrangThai { get; set; }
        public DateTime? ThoiGianNhan { get; set; }
        public DateTime? ThoiGianGiao { get; set; }
        public string? GhiChu { get; set; }
    }
}
