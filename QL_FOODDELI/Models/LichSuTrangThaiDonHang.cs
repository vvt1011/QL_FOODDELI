using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class LichSuTrangThaiDonHang
{
    public int MaLichSu { get; set; }

    public int MaDonHang { get; set; }

    public string? TrangThaiCu { get; set; }

    public string TrangThaiMoi { get; set; } = null!;

    public int? NguoiThayDoi { get; set; }

    public DateTime ThoiGianThayDoi { get; set; }

    public string? GhiChu { get; set; }

    public virtual DonHang MaDonHangNavigation { get; set; } = null!;

    public virtual NguoiDung? NguoiThayDoiNavigation { get; set; }
}
