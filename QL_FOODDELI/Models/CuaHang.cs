using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class CuaHang
{
    public int MaCuaHang { get; set; }

    public int MaChuShop { get; set; }

    public string TenCuaHang { get; set; } = null!;

    public string? MoTa { get; set; }

    public string? SoDienThoai { get; set; }

    public string DiaChi { get; set; } = null!;

    public string? AnhCuaHang { get; set; }

    public decimal DanhGia { get; set; }

    public string TrangThai { get; set; } = null!;

    public DateTime NgayTao { get; set; }

    public virtual ICollection<DanhGium> DanhGiaNavigation { get; set; } = new List<DanhGium>();

    public virtual NguoiDung MaChuShopNavigation { get; set; } = null!;

    public virtual ICollection<MonAn> MonAns { get; set; } = new List<MonAn>();
}
