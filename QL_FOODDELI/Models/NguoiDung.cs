using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class NguoiDung
{
    public int MaNguoiDung { get; set; }

    public string HoTen { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string MatKhau { get; set; } = null!;

    public string? SoDienThoai { get; set; }

    public string? AnhDaiDien { get; set; }

    public bool TrangThai { get; set; }

    public DateTime NgayTao { get; set; }

    public virtual ICollection<CuaHang> CuaHangs { get; set; } = new List<CuaHang>();

    public virtual ICollection<DanhGium> DanhGia { get; set; } = new List<DanhGium>();

    public virtual ICollection<DiaChi> DiaChis { get; set; } = new List<DiaChi>();

    public virtual ICollection<DonHang> DonHangs { get; set; } = new List<DonHang>();

    public virtual GioHang? GioHang { get; set; }

    public virtual ICollection<LichSuTrangThaiDonHang> LichSuTrangThaiDonHangs { get; set; } = new List<LichSuTrangThaiDonHang>();

    public virtual ICollection<MonAnYeuThich> MonAnYeuThiches { get; set; } = new List<MonAnYeuThich>();

    public virtual NguoiGiaoHang? NguoiGiaoHang { get; set; }

    public virtual ICollection<PhienChat> PhienChats { get; set; } = new List<PhienChat>();

    public virtual ICollection<VaiTro> MaVaiTros { get; set; } = new List<VaiTro>();
}
