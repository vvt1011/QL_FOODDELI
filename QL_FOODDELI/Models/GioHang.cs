namespace QL_FOODDELI.Models
{
    public class GioHang
    {
        public string MaGioHang { get; set; } = string.Empty;
        public string? MaNguoiDung { get; set; }
        public DateTime? NgayTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public List<ChiTietGioHang>? Items { get; set; }
    }
}
