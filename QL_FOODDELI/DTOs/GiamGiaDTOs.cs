namespace QL_FOODDELI.DTOs
{
    public class VoucherCreateRequest
    {
        public string MaVoucher { get; set; } = string.Empty; // VD: FREESHIP, GIAM30K
        public string TenVoucher { get; set; } = string.Empty;
        public string LoaiGiamGia { get; set; } = "SoTien"; // "SoTien" hoặc "PhanTram"
        public double GiaTri { get; set; }
        public double GiamToiDa { get; set; }
        public double GiaTriDonToiThieu { get; set; }
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }
        public int SoLuong { get; set; }
    }

    public class KiemTraVoucherRequest
    {
        public string MaVoucher { get; set; } = string.Empty;
        public double TongTienDonHang { get; set; }
    }

    public class KiemTraVoucherResponse
    {
        public bool HopLe { get; set; }
        public string ThongBao { get; set; } = string.Empty;
        public double SoTienGiam { get; set; }
    }
}
