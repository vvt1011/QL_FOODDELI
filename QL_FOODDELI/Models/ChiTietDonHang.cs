namespace QL_FOODDELI.Models
{
    public class ChiTietDonHang
    {
        public string MaChiTietDonHang { get; set; } = string.Empty;
        public string? MaDonHang { get; set; }
        public string? MaMonAn { get; set; }
        public string? TenMonAn { get; set; }
        public string? AnhMonAn { get; set; }
        public int? SoLuong { get; set; }
        public double? DonGia { get; set; }
        public double? ThanhTien { get; set; }
        public string? status { get; set; } // Dùng khi update chi tiết đơn hàng: 1 - Thêm, 2 - Sửa, 3 - Xóa
    }
}
