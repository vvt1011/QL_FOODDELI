using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class VaiTro
{
    public int MaVaiTro { get; set; }

    public string TenVaiTro { get; set; } = null!;

    public virtual ICollection<NguoiDung> MaNguoiDungs { get; set; } = new List<NguoiDung>();
}
