using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class ChiTietGioHang
{
    public int MaChiTietGioHang { get; set; }

    public int MaGioHang { get; set; }

    public int MaMonAn { get; set; }

    public int SoLuong { get; set; }

    public decimal Gia { get; set; }

    public virtual GioHang MaGioHangNavigation { get; set; } = null!;

    public virtual MonAn MaMonAnNavigation { get; set; } = null!;
}
