using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class MonAnYeuThich
{
    public int MaYeuThich { get; set; }

    public int MaNguoiDung { get; set; }

    public int MaMonAn { get; set; }

    public DateTime NgayThem { get; set; }

    public virtual MonAn MaMonAnNavigation { get; set; } = null!;

    public virtual NguoiDung MaNguoiDungNavigation { get; set; } = null!;
}
