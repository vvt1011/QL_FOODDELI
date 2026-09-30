namespace QL_FOODDELI.Models
{
    public class LichSuTrangThaiDonHang
    {
        public string MaLichSu { get; set; } = string.Empty;
        public string MaDonHang { get; set; } = string.Empty;
        public int? TrangThaiCu { get; set; }
        public int? TrangThaiMoi { get; set; }
        public string? MaNguoiThayDoi { get; set; }
        public DateTime? ThoiGian { get; set; }
        public string? GhiChu { get; set; }
    }
}
