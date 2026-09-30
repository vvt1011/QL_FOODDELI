namespace QL_FOODDELI.DTOs
{
    public class ChiTietDonHangCreateDto
    {
        public string? MaChiTietDonHang { get; set; }
        public string MaMonAn { get; set; } = string.Empty;
        public int SoLuong { get; set; }
        public double DonGia { get; set; }
        public double ThanhTien { get; set; }
    }

    public class DonHangCreateRequest
    {
        public string? MaDonHang { get; set; }
        public string MaDiaChi { get; set; } = string.Empty;
        public double TongTien { get; set; }
        public double PhiGiaoHang { get; set; }
        public double GiamGia { get; set; }
        public double ThanhTien { get; set; }
        public string? GhiChu { get; set; }
        public List<ChiTietDonHangCreateDto> ChiTiets { get; set; } = new List<ChiTietDonHangCreateDto>();
    }

    public class ChiTietDonHangUpdate
    {
        public string? MaChiTietDonHang { get; set; }

        public string MaMonAn { get; set; } = string.Empty;

        public int SoLuong { get; set; }

        public double DonGia { get; set; }

        public double ThanhTien { get; set; }

        public string status { get; set; } = "2";
    }

    public class DonHangUpdateRequest
    {
        public string MaDonHang { get; set; } = string.Empty;

        public string TrangThai { get; set; } = string.Empty;

        public string? GhiChu { get; set; }

        public List<ChiTietDonHangUpdate>? listjson_chitiet { get; set; }
    }
}