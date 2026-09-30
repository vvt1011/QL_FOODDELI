namespace QL_FOODDELI.Models
{
    public class MonAn
    {
        public string MaMonAn { get; set; } = string.Empty;
        public string? MaCuaHang { get; set; }
        public string? MaDanhMuc { get; set; }
        public string? TenMonAn { get; set; }
        public string? MoTa { get; set; }
        public double? Gia { get; set; }
        public string? AnhMonAn { get; set; }
        public double? DanhGia { get; set; }
        public int? TrangThai { get; set; }
        public DateTime? NgayTao { get; set; }
        public long? RecordCount { get; set; }
    }
}
