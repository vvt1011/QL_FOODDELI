using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class ThanhToan
{
    public int MaThanhToan { get; set; }

    public int MaDonHang { get; set; }

    public string PhuongThucThanhToan { get; set; } = null!;

    public decimal SoTien { get; set; }

    public string TrangThai { get; set; } = null!;

    public string? MaGiaoDich { get; set; }

    public DateTime? ThoiGianThanhToan { get; set; }

    public DateTime NgayTao { get; set; }

    public virtual DonHang MaDonHangNavigation { get; set; } = null!;
}
