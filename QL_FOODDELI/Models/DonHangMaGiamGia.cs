using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class DonHangMaGiamGium
{
    public int MaDonHang { get; set; }

    public int MaMaGiamGia { get; set; }

    public decimal TienGiam { get; set; }

    public virtual DonHang MaDonHangNavigation { get; set; } = null!;

    public virtual MaGiamGium MaMaGiamGiaNavigation { get; set; } = null!;
}
