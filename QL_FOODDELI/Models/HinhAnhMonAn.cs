using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class HinhAnhMonAn
{
    public int MaHinhAnh { get; set; }

    public int MaMonAn { get; set; }

    public string DuongDanAnh { get; set; } = null!;

    public bool LaAnhChinh { get; set; }

    public virtual MonAn MaMonAnNavigation { get; set; } = null!;
}
