using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class GiaoHang
{
    public int MaGiaoHang { get; set; }

    public int MaDonHang { get; set; }

    public int? MaNguoiGiaoHang { get; set; }

    public string TrangThaiGiaoHang { get; set; } = null!;

    public DateTime? ThoiGianNhan { get; set; }

    public DateTime? ThoiGianGiao { get; set; }

    public string? GhiChu { get; set; }

    public virtual DonHang MaDonHangNavigation { get; set; } = null!;

    public virtual NguoiGiaoHang? MaNguoiGiaoHangNavigation { get; set; }
}
