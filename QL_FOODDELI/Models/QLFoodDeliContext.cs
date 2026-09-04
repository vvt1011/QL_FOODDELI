using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace QL_FOODDELI.Models;

public partial class QLFoodDeliContext : DbContext
{
    public QLFoodDeliContext()
    {
    }

    public QLFoodDeliContext(DbContextOptions<QLFoodDeliContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ChiTietDonHang> ChiTietDonHangs { get; set; }

    public virtual DbSet<ChiTietGioHang> ChiTietGioHangs { get; set; }

    public virtual DbSet<CuaHang> CuaHangs { get; set; }

    public virtual DbSet<DanhGium> DanhGia { get; set; }

    public virtual DbSet<DanhMuc> DanhMucs { get; set; }

    public virtual DbSet<DiaChi> DiaChis { get; set; }

    public virtual DbSet<DonHang> DonHangs { get; set; }

    public virtual DbSet<DonHangMaGiamGium> DonHangMaGiamGia { get; set; }

    public virtual DbSet<GiaoHang> GiaoHangs { get; set; }

    public virtual DbSet<GioHang> GioHangs { get; set; }

    public virtual DbSet<HinhAnhMonAn> HinhAnhMonAns { get; set; }

    public virtual DbSet<LichSuTrangThaiDonHang> LichSuTrangThaiDonHangs { get; set; }

    public virtual DbSet<MaGiamGium> MaGiamGia { get; set; }

    public virtual DbSet<MonAn> MonAns { get; set; }

    public virtual DbSet<MonAnYeuThich> MonAnYeuThiches { get; set; }

    public virtual DbSet<NguoiDung> NguoiDungs { get; set; }

    public virtual DbSet<NguoiGiaoHang> NguoiGiaoHangs { get; set; }

    public virtual DbSet<PhienChat> PhienChats { get; set; }

    public virtual DbSet<ThanhToan> ThanhToans { get; set; }

    public virtual DbSet<TinNhanChat> TinNhanChats { get; set; }

    public virtual DbSet<VaiTro> VaiTros { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=.\\SQLEXPRESS;Database=QL_FoodDeli;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ChiTietDonHang>(entity =>
        {
            entity.HasKey(e => e.MaChiTietDonHang).HasName("PK__ChiTietD__4B0B45DD29C5459E");

            entity.ToTable("ChiTietDonHang");

            entity.Property(e => e.Gia).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TenMonAn).HasMaxLength(150);
            entity.Property(e => e.ThanhTien)
                .HasComputedColumnSql("([SoLuong]*[Gia])", true)
                .HasColumnType("decimal(29, 2)");

            entity.HasOne(d => d.MaDonHangNavigation).WithMany(p => p.ChiTietDonHangs)
                .HasForeignKey(d => d.MaDonHang)
                .HasConstraintName("FK_ChiTietDonHang_DonHang");

            entity.HasOne(d => d.MaMonAnNavigation).WithMany(p => p.ChiTietDonHangs)
                .HasForeignKey(d => d.MaMonAn)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ChiTietDonHang_MonAn");
        });

        modelBuilder.Entity<ChiTietGioHang>(entity =>
        {
            entity.HasKey(e => e.MaChiTietGioHang).HasName("PK__ChiTietG__BBF47498DF9D1BC2");

            entity.ToTable("ChiTietGioHang");

            entity.Property(e => e.Gia).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.MaGioHangNavigation).WithMany(p => p.ChiTietGioHangs)
                .HasForeignKey(d => d.MaGioHang)
                .HasConstraintName("FK_ChiTietGioHang_GioHang");

            entity.HasOne(d => d.MaMonAnNavigation).WithMany(p => p.ChiTietGioHangs)
                .HasForeignKey(d => d.MaMonAn)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ChiTietGioHang_MonAn");
        });

        modelBuilder.Entity<CuaHang>(entity =>
        {
            entity.HasKey(e => e.MaCuaHang).HasName("PK__CuaHang__0840BCA6CB8B490B");

            entity.ToTable("CuaHang");

            entity.Property(e => e.AnhCuaHang)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.DanhGia).HasColumnType("decimal(2, 1)");
            entity.Property(e => e.DiaChi).HasMaxLength(300);
            entity.Property(e => e.MoTa).HasMaxLength(1000);
            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.SoDienThoai)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.TenCuaHang).HasMaxLength(150);
            entity.Property(e => e.TrangThai)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasDefaultValue("Ch? Duy?t");

            entity.HasOne(d => d.MaChuShopNavigation).WithMany(p => p.CuaHangs)
                .HasForeignKey(d => d.MaChuShop)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CuaHang_NguoiDung");
        });

        modelBuilder.Entity<DanhGium>(entity =>
        {
            entity.HasKey(e => e.MaDanhGia).HasName("PK__DanhGia__AA9515BF3F8F6BCB");

            entity.Property(e => e.BinhLuan).HasMaxLength(1000);
            entity.Property(e => e.NgayDanhGia).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.MaCuaHangNavigation).WithMany(p => p.DanhGiaNavigation)
                .HasForeignKey(d => d.MaCuaHang)
                .HasConstraintName("FK_DanhGia_CuaHang");

            entity.HasOne(d => d.MaDonHangNavigation).WithMany(p => p.DanhGia)
                .HasForeignKey(d => d.MaDonHang)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DanhGia_DonHang");

            entity.HasOne(d => d.MaMonAnNavigation).WithMany(p => p.DanhGiaNavigation)
                .HasForeignKey(d => d.MaMonAn)
                .HasConstraintName("FK_DanhGia_MonAn");

            entity.HasOne(d => d.MaNguoiDungNavigation).WithMany(p => p.DanhGia)
                .HasForeignKey(d => d.MaNguoiDung)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DanhGia_NguoiDung");
        });

        modelBuilder.Entity<DanhMuc>(entity =>
        {
            entity.HasKey(e => e.MaDanhMuc).HasName("PK__DanhMuc__B3750887A57E2F4B");

            entity.ToTable("DanhMuc");

            entity.Property(e => e.AnhDanhMuc)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.MoTa).HasMaxLength(500);
            entity.Property(e => e.TenDanhMuc).HasMaxLength(100);
            entity.Property(e => e.TrangThai).HasDefaultValue(true);
        });

        modelBuilder.Entity<DiaChi>(entity =>
        {
            entity.HasKey(e => e.MaDiaChi).HasName("PK__DiaChi__EB61213E9C8504DA");

            entity.ToTable("DiaChi");

            entity.Property(e => e.DiaChiChiTiet).HasMaxLength(300);
            entity.Property(e => e.Phuong).HasMaxLength(100);
            entity.Property(e => e.Quan).HasMaxLength(100);
            entity.Property(e => e.SoDienThoai)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.TenNguoiNhan).HasMaxLength(100);
            entity.Property(e => e.TinhThanhPho).HasMaxLength(100);

            entity.HasOne(d => d.MaNguoiDungNavigation).WithMany(p => p.DiaChis)
                .HasForeignKey(d => d.MaNguoiDung)
                .HasConstraintName("FK_DiaChi_NguoiDung");
        });

        modelBuilder.Entity<DonHang>(entity =>
        {
            entity.HasKey(e => e.MaDonHang).HasName("PK__DonHang__129584AD0C5AB5F4");

            entity.ToTable("DonHang");

            entity.Property(e => e.GhiChu).HasMaxLength(500);
            entity.Property(e => e.NgayDat).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.PhiVanChuyen).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.PhuongThucThanhToan)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.TienGiam).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TongTien).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TrangThaiDonHang)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasDefaultValue("ChoXacNhan");
            entity.Property(e => e.TrangThaiThanhToan)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasDefaultValue("ChoThanhToan");

            entity.HasOne(d => d.MaDiaChiNavigation).WithMany(p => p.DonHangs)
                .HasForeignKey(d => d.MaDiaChi)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DonHang_DiaChi");

            entity.HasOne(d => d.MaNguoiDungNavigation).WithMany(p => p.DonHangs)
                .HasForeignKey(d => d.MaNguoiDung)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DonHang_NguoiDung");
        });

        modelBuilder.Entity<DonHangMaGiamGium>(entity =>
        {
            entity.HasKey(e => new { e.MaDonHang, e.MaMaGiamGia }).HasName("PK__DonHang___9C38FCE86A19ADC2");

            entity.ToTable("DonHang_MaGiamGia");

            entity.Property(e => e.TienGiam).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.MaDonHangNavigation).WithMany(p => p.DonHangMaGiamGia)
                .HasForeignKey(d => d.MaDonHang)
                .HasConstraintName("FK_DonHangMaGiamGia_DonHang");

            entity.HasOne(d => d.MaMaGiamGiaNavigation).WithMany(p => p.DonHangMaGiamGia)
                .HasForeignKey(d => d.MaMaGiamGia)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DonHangMaGiamGia_MaGiamGia");
        });

        modelBuilder.Entity<GiaoHang>(entity =>
        {
            entity.HasKey(e => e.MaGiaoHang).HasName("PK__GiaoHang__81CCF4FDA03CD953");

            entity.ToTable("GiaoHang");

            entity.HasIndex(e => e.MaDonHang, "UQ__GiaoHang__129584AC9AC47D65").IsUnique();

            entity.Property(e => e.GhiChu).HasMaxLength(500);
            entity.Property(e => e.TrangThaiGiaoHang)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasDefaultValue("ChoGiao");

            entity.HasOne(d => d.MaDonHangNavigation).WithOne(p => p.GiaoHang)
                .HasForeignKey<GiaoHang>(d => d.MaDonHang)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_GiaoHang_DonHang");

            entity.HasOne(d => d.MaNguoiGiaoHangNavigation).WithMany(p => p.GiaoHangs)
                .HasForeignKey(d => d.MaNguoiGiaoHang)
                .HasConstraintName("FK_GiaoHang_NguoiGiaoHang");
        });

        modelBuilder.Entity<GioHang>(entity =>
        {
            entity.HasKey(e => e.MaGioHang).HasName("PK__GioHang__F5001DA3953E7762");

            entity.ToTable("GioHang");

            entity.HasIndex(e => e.MaNguoiDung, "UQ__GioHang__C539D763DF9D4B90").IsUnique();

            entity.Property(e => e.NgayCapNhat).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.MaNguoiDungNavigation).WithOne(p => p.GioHang)
                .HasForeignKey<GioHang>(d => d.MaNguoiDung)
                .HasConstraintName("FK_GioHang_NguoiDung");
        });

        modelBuilder.Entity<HinhAnhMonAn>(entity =>
        {
            entity.HasKey(e => e.MaHinhAnh).HasName("PK__HinhAnhM__A9C37A9B1EF47EAB");

            entity.ToTable("HinhAnhMonAn");

            entity.Property(e => e.DuongDanAnh)
                .HasMaxLength(500)
                .IsUnicode(false);

            entity.HasOne(d => d.MaMonAnNavigation).WithMany(p => p.HinhAnhMonAns)
                .HasForeignKey(d => d.MaMonAn)
                .HasConstraintName("FK_HinhAnhMonAn_MonAn");
        });

        modelBuilder.Entity<LichSuTrangThaiDonHang>(entity =>
        {
            entity.HasKey(e => e.MaLichSu).HasName("PK__LichSuTr__C443222AE002A157");

            entity.ToTable("LichSuTrangThaiDonHang");

            entity.Property(e => e.GhiChu).HasMaxLength(500);
            entity.Property(e => e.ThoiGianThayDoi).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.TrangThaiCu)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.TrangThaiMoi)
                .HasMaxLength(30)
                .IsUnicode(false);

            entity.HasOne(d => d.MaDonHangNavigation).WithMany(p => p.LichSuTrangThaiDonHangs)
                .HasForeignKey(d => d.MaDonHang)
                .HasConstraintName("FK_LichSuTrangThai_DonHang");

            entity.HasOne(d => d.NguoiThayDoiNavigation).WithMany(p => p.LichSuTrangThaiDonHangs)
                .HasForeignKey(d => d.NguoiThayDoi)
                .HasConstraintName("FK_LichSuTrangThai_NguoiDung");
        });

        modelBuilder.Entity<MaGiamGium>(entity =>
        {
            entity.HasKey(e => e.MaMaGiamGia).HasName("PK__MaGiamGi__EAD784595EF5F446");

            entity.HasIndex(e => e.MaCode, "UQ__MaGiamGi__152C7C5C054916C2").IsUnique();

            entity.Property(e => e.DonToiThieu).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.GiaTriGiam).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.GiamToiDa).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.LoaiGiamGia)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.MaCode)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.MoTa).HasMaxLength(500);
            entity.Property(e => e.TrangThai).HasDefaultValue(true);
        });

        modelBuilder.Entity<MonAn>(entity =>
        {
            entity.HasKey(e => e.MaMonAn).HasName("PK__MonAn__B11716255CD53E8C");

            entity.ToTable("MonAn");

            entity.Property(e => e.AnhMonAn)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.DanhGia).HasColumnType("decimal(2, 1)");
            entity.Property(e => e.Gia).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.MoTa).HasMaxLength(1000);
            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.TenMonAn).HasMaxLength(150);
            entity.Property(e => e.TrangThai).HasDefaultValue(true);

            entity.HasOne(d => d.MaCuaHangNavigation).WithMany(p => p.MonAns)
                .HasForeignKey(d => d.MaCuaHang)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_MonAn_CuaHang");

            entity.HasOne(d => d.MaDanhMucNavigation).WithMany(p => p.MonAns)
                .HasForeignKey(d => d.MaDanhMuc)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_MonAn_DanhMuc");
        });

        modelBuilder.Entity<MonAnYeuThich>(entity =>
        {
            entity.HasKey(e => e.MaYeuThich).HasName("PK__MonAnYeu__B9007E4CA2C2B983");

            entity.ToTable("MonAnYeuThich");

            entity.HasIndex(e => new { e.MaNguoiDung, e.MaMonAn }, "UQ_MonAnYeuThich").IsUnique();

            entity.Property(e => e.NgayThem).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.MaMonAnNavigation).WithMany(p => p.MonAnYeuThiches)
                .HasForeignKey(d => d.MaMonAn)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_MonAnYeuThich_MonAn");

            entity.HasOne(d => d.MaNguoiDungNavigation).WithMany(p => p.MonAnYeuThiches)
                .HasForeignKey(d => d.MaNguoiDung)
                .HasConstraintName("FK_MonAnYeuThich_NguoiDung");
        });

        modelBuilder.Entity<NguoiDung>(entity =>
        {
            entity.HasKey(e => e.MaNguoiDung).HasName("PK__NguoiDun__C539D7626955A526");

            entity.ToTable("NguoiDung");

            entity.HasIndex(e => e.Email, "UQ__NguoiDun__A9D10534775063B2").IsUnique();

            entity.Property(e => e.AnhDaiDien)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Email)
                .HasMaxLength(150)
                .IsUnicode(false);
            entity.Property(e => e.HoTen).HasMaxLength(100);
            entity.Property(e => e.MatKhau)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.SoDienThoai)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.TrangThai).HasDefaultValue(true);

            entity.HasMany(d => d.MaVaiTros).WithMany(p => p.MaNguoiDungs)
                .UsingEntity<Dictionary<string, object>>(
                    "NguoiDungVaiTro",
                    r => r.HasOne<VaiTro>().WithMany()
                        .HasForeignKey("MaVaiTro")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_NguoiDungVaiTro_VaiTro"),
                    l => l.HasOne<NguoiDung>().WithMany()
                        .HasForeignKey("MaNguoiDung")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_NguoiDungVaiTro_NguoiDung"),
                    j =>
                    {
                        j.HasKey("MaNguoiDung", "MaVaiTro").HasName("PK__NguoiDun__291D137EC4CAA481");
                        j.ToTable("NguoiDung_VaiTro");
                    });
        });

        modelBuilder.Entity<NguoiGiaoHang>(entity =>
        {
            entity.HasKey(e => e.MaNguoiGiaoHang).HasName("PK__NguoiGia__B007345B45DD9021");

            entity.ToTable("NguoiGiaoHang");

            entity.HasIndex(e => e.MaNguoiDung, "UQ__NguoiGia__C539D7636DDFD83E").IsUnique();

            entity.Property(e => e.BienSoXe)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.PhuongTien).HasMaxLength(100);
            entity.Property(e => e.TrangThai)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasDefaultValue("SanSang");

            entity.HasOne(d => d.MaNguoiDungNavigation).WithOne(p => p.NguoiGiaoHang)
                .HasForeignKey<NguoiGiaoHang>(d => d.MaNguoiDung)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_NguoiGiaoHang_NguoiDung");
        });

        modelBuilder.Entity<PhienChat>(entity =>
        {
            entity.HasKey(e => e.MaPhienChat).HasName("PK__PhienCha__A91ECE760755F56B");

            entity.ToTable("PhienChat");

            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.MaNguoiDungNavigation).WithMany(p => p.PhienChats)
                .HasForeignKey(d => d.MaNguoiDung)
                .HasConstraintName("FK_PhienChat_NguoiDung");
        });

        modelBuilder.Entity<ThanhToan>(entity =>
        {
            entity.HasKey(e => e.MaThanhToan).HasName("PK__ThanhToa__D4B25844A076AD9E");

            entity.ToTable("ThanhToan");

            entity.HasIndex(e => e.MaDonHang, "UQ__ThanhToa__129584ACC3D89E66").IsUnique();

            entity.Property(e => e.MaGiaoDich)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.PhuongThucThanhToan)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.SoTien).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasDefaultValue("ChoThanhToan");

            entity.HasOne(d => d.MaDonHangNavigation).WithOne(p => p.ThanhToan)
                .HasForeignKey<ThanhToan>(d => d.MaDonHang)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ThanhToan_DonHang");
        });

        modelBuilder.Entity<TinNhanChat>(entity =>
        {
            entity.HasKey(e => e.MaTinNhan).HasName("PK__TinNhanC__E5B3062AE14CACA2");

            entity.ToTable("TinNhanChat");

            entity.Property(e => e.NguoiGui)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.ThoiGianGui).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.MaPhienChatNavigation).WithMany(p => p.TinNhanChats)
                .HasForeignKey(d => d.MaPhienChat)
                .HasConstraintName("FK_TinNhanChat_PhienChat");
        });

        modelBuilder.Entity<VaiTro>(entity =>
        {
            entity.HasKey(e => e.MaVaiTro).HasName("PK__VaiTro__C24C41CFC2FB7B4A");

            entity.ToTable("VaiTro");

            entity.HasIndex(e => e.TenVaiTro, "UQ__VaiTro__1DA5581472993682").IsUnique();

            entity.Property(e => e.TenVaiTro)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
