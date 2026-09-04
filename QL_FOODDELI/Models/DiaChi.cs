using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class DiaChi
{
    public int MaDiaChi { get; set; }

    public int MaNguoiDung { get; set; }

    public string TenNguoiNhan { get; set; } = null!;

    public string SoDienThoai { get; set; } = null!;

    public string DiaChiChiTiet { get; set; } = null!;

    public string? Phuong { get; set; }

    public string? Quan { get; set; }

    public string? TinhThanhPho { get; set; }

    public bool LaDiaChiMacDinh { get; set; }

    public virtual ICollection<DonHang> DonHangs { get; set; } = new List<DonHang>();

    public virtual NguoiDung MaNguoiDungNavigation { get; set; } = null!;
}
