using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class PhienChat
{
    public int MaPhienChat { get; set; }

    public int MaNguoiDung { get; set; }

    public DateTime NgayTao { get; set; }

    public DateTime? NgayCapNhat { get; set; }

    public virtual NguoiDung MaNguoiDungNavigation { get; set; } = null!;

    public virtual ICollection<TinNhanChat> TinNhanChats { get; set; } = new List<TinNhanChat>();
}
