using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class MonAn
{
    public int MaMonAn { get; set; }

    public int MaCuaHang { get; set; }

    public int MaDanhMuc { get; set; }

    public string TenMonAn { get; set; } = null!;

    public string? MoTa { get; set; }

    public decimal Gia { get; set; }

    public string? AnhMonAn { get; set; }

    public decimal DanhGia { get; set; }

    public bool TrangThai { get; set; }

    public DateTime NgayTao { get; set; }

    public virtual ICollection<ChiTietDonHang> ChiTietDonHangs { get; set; } = new List<ChiTietDonHang>();

    public virtual ICollection<ChiTietGioHang> ChiTietGioHangs { get; set; } = new List<ChiTietGioHang>();

    public virtual ICollection<DanhGium> DanhGiaNavigation { get; set; } = new List<DanhGium>();

    public virtual ICollection<HinhAnhMonAn> HinhAnhMonAns { get; set; } = new List<HinhAnhMonAn>();

    public virtual CuaHang MaCuaHangNavigation { get; set; } = null!;

    public virtual DanhMuc MaDanhMucNavigation { get; set; } = null!;

    public virtual ICollection<MonAnYeuThich> MonAnYeuThiches { get; set; } = new List<MonAnYeuThich>();
}
