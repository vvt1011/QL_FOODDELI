using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class NguoiGiaoHang
{
    public int MaNguoiGiaoHang { get; set; }

    public int MaNguoiDung { get; set; }

    public string? PhuongTien { get; set; }

    public string? BienSoXe { get; set; }

    public string TrangThai { get; set; } = null!;

    public virtual ICollection<GiaoHang> GiaoHangs { get; set; } = new List<GiaoHang>();

    public virtual NguoiDung MaNguoiDungNavigation { get; set; } = null!;
}
