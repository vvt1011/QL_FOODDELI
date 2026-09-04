using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class DonHang
{
    public int MaDonHang { get; set; }

    public int MaNguoiDung { get; set; }

    public int MaDiaChi { get; set; }

    public decimal TongTien { get; set; }

    public decimal PhiVanChuyen { get; set; }

    public decimal TienGiam { get; set; }

    public string PhuongThucThanhToan { get; set; } = null!;

    public string TrangThaiThanhToan { get; set; } = null!;

    public string TrangThaiDonHang { get; set; } = null!;

    public string? GhiChu { get; set; }

    public DateTime NgayDat { get; set; }

    public virtual ICollection<ChiTietDonHang> ChiTietDonHangs { get; set; } = new List<ChiTietDonHang>();

    public virtual ICollection<DanhGium> DanhGia { get; set; } = new List<DanhGium>();

    public virtual ICollection<DonHangMaGiamGium> DonHangMaGiamGia { get; set; } = new List<DonHangMaGiamGium>();

    public virtual GiaoHang? GiaoHang { get; set; }

    public virtual ICollection<LichSuTrangThaiDonHang> LichSuTrangThaiDonHangs { get; set; } = new List<LichSuTrangThaiDonHang>();

    public virtual DiaChi MaDiaChiNavigation { get; set; } = null!;

    public virtual NguoiDung MaNguoiDungNavigation { get; set; } = null!;

    public virtual ThanhToan? ThanhToan { get; set; }
}
