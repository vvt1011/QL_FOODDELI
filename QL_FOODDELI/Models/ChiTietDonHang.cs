using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class ChiTietDonHang
{
    public int MaChiTietDonHang { get; set; }

    public int MaDonHang { get; set; }

    public int MaMonAn { get; set; }

    public string TenMonAn { get; set; } = null!;

    public int SoLuong { get; set; }

    public decimal Gia { get; set; }

    public decimal? ThanhTien { get; set; }

    public virtual DonHang MaDonHangNavigation { get; set; } = null!;

    public virtual MonAn MaMonAnNavigation { get; set; } = null!;
}
