namespace QL_FOODDELI.DTOs
{
    public class DoanhThuTheoThoiGianDto
    {
        public string MocThoiGian { get; set; } = string.Empty;
        public int SoDonHang { get; set; }
        public double TongDoanhThu { get; set; }
        public double DoanhThuThucTe { get; set; }
        public int SoDonThanhCong { get; set; }
        public int SoDonHuy { get; set; }
    }

    public class TopMonAnDto
    {
        public string MaMonAn { get; set; } = string.Empty;
        public string TenMonAn { get; set; } = string.Empty;
        public string? AnhMonAn { get; set; }
        public double Gia { get; set; }
        public string? MaCuaHang { get; set; }
        public string? TenCuaHang { get; set; }
        public string? TenDanhMuc { get; set; }
        public int TongSoLuongBan { get; set; }
        public double TongDoanhThu { get; set; }
        public double DiemDanhGiaTrungBinh { get; set; }
        public int SoLuotDanhGia { get; set; }
    }

    public class ThongKeTongQuanDto
    {
        public int TongSoDonHang { get; set; }
        public double TongDoanhThu { get; set; }
        public double DoanhThuThucTe { get; set; }
        public int SoDonThanhCong { get; set; }
        public int SoDonHuy { get; set; }
        public int TongSoKhachHang { get; set; }
        public int TongSoMonAn { get; set; }
        public int TongSoCuaHang { get; set; }
    }
}
