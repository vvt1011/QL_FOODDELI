using System;
using System.Collections.Generic;

namespace QL_FOODDELI.Models;

public partial class TinNhanChat
{
    public int MaTinNhan { get; set; }

    public int MaPhienChat { get; set; }

    public string NguoiGui { get; set; } = null!;

    public string NoiDung { get; set; } = null!;

    public DateTime ThoiGianGui { get; set; }

    public virtual PhienChat MaPhienChatNavigation { get; set; } = null!;
}
