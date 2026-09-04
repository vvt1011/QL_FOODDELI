using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class DanhMuc
{
    public int MaDanhMuc { get; set; }

    public string TenDanhMuc { get; set; } = null!;

    public string? MoTa { get; set; }

    public string? AnhDanhMuc { get; set; }

    public bool TrangThai { get; set; }

    public virtual ICollection<MonAn> MonAns { get; set; } = new List<MonAn>();
}
