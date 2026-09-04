using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class MaGiamGium
{
    public int MaMaGiamGia { get; set; }

    public string MaCode { get; set; } = null!;

    public string? MoTa { get; set; }

    public string LoaiGiamGia { get; set; } = null!;

    public decimal GiaTriGiam { get; set; }

    public decimal DonToiThieu { get; set; }

    public decimal? GiamToiDa { get; set; }

    public int? SoLuong { get; set; }

    public DateTime NgayBatDau { get; set; }

    public DateTime NgayKetThuc { get; set; }

    public bool TrangThai { get; set; }

    public virtual ICollection<DonHangMaGiamGium> DonHangMaGiamGia { get; set; } = new List<DonHangMaGiamGium>();
}
