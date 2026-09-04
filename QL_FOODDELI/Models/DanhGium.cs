using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class DanhGium
{
    public int MaDanhGia { get; set; }

    public int MaNguoiDung { get; set; }

    public int MaDonHang { get; set; }

    public int? MaMonAn { get; set; }

    public int? MaCuaHang { get; set; }

    public int SoSao { get; set; }

    public string? BinhLuan { get; set; }

    public DateTime NgayDanhGia { get; set; }

    public virtual CuaHang? MaCuaHangNavigation { get; set; }

    public virtual DonHang MaDonHangNavigation { get; set; } = null!;

    public virtual MonAn? MaMonAnNavigation { get; set; }

    public virtual NguoiDung MaNguoiDungNavigation { get; set; } = null!;
}
