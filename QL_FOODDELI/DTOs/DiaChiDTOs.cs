namespace QL_FOODDELI.DTOs
{
    public class DiaChiCreateRequest
    {
        public string? MaDiaChi { get; set; }
        public string NguoiNhan { get; set; } = string.Empty;
        public string SoDienThoai { get; set; } = string.Empty;
        public string DiaChiChiTiet { get; set; } = string.Empty;
        public string PhuongXa { get; set; } = string.Empty;
        public string QuanHuyen { get; set; } = string.Empty;
        public string TinhThanh { get; set; } = string.Empty;
        public bool MacDinh { get; set; } = false;
    }

    public class DiaChiUpdateRequest : DiaChiCreateRequest
    {
        public new string MaDiaChi { get; set; } = string.Empty;
    }
}
