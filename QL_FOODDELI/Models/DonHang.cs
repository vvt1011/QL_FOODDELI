namespace QL_FOODDELI.Models
{
    public class DonHang
    {
        public string MaDonHang { get; set; } = string.Empty;
        public string? MaNguoiDung { get; set; }
        public string? MaDiaChi { get; set; }
        public double? TongTien { get; set; }
        public double? PhiGiaoHang { get; set; }
        public double? GiamGia { get; set; }
        public double? ThanhTien { get; set; }
        public string? TrangThai { get; set; }
        public DateTime? NgayDat { get; set; }
        public string? GhiChu { get; set; }
        public string? listjson_chitiet { get; set; }
        public List<ChiTietDonHang>? ChiTietDonHangs { get; set; }
    }
}
