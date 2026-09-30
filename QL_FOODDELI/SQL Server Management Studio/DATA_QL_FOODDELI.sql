create database QL_Delivery;
use QL_Delivery	;
go

--------------------------------------------------
-- 1. TẠO BẢNG DỮ LIỆU (TABLES)
--------------------------------------------------

/****** Object: Table [dbo].[NguoiDung] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[NguoiDung](
    [MaNguoiDung] [varchar](50) NOT NULL,
    [HoTen] [nvarchar](150) NULL,
    [Email] [varchar](150) NULL,
    [MatKhau] [varchar](150) NULL,
    [SoDienThoai] [varchar](30) NULL,
    [AnhDaiDien] [varchar](300) NULL,
    [TrangThai] [int] NULL,
    [NgayTao] [datetime] NULL,
 CONSTRAINT [PK_NguoiDung] PRIMARY KEY CLUSTERED ([MaNguoiDung] ASC)
) ON [PRIMARY]
GO

/****** Object: Table [dbo].[VaiTro] ******/
CREATE TABLE [dbo].[VaiTro](
    [MaVaiTro] [varchar](50) NOT NULL,
    [TenVaiTro] [nvarchar](150) NULL,
 CONSTRAINT [PK_VaiTro] PRIMARY KEY CLUSTERED ([MaVaiTro] ASC)
) ON [PRIMARY]
GO

/****** Object: Table [dbo].[NguoiDung_VaiTro] ******/
CREATE TABLE [dbo].[NguoiDung_VaiTro](
    [MaNguoiDung] [varchar](50) NOT NULL,
    [MaVaiTro] [varchar](50) NOT NULL,
 CONSTRAINT [PK_NguoiDung_VaiTro] PRIMARY KEY CLUSTERED ([MaNguoiDung] ASC, [MaVaiTro] ASC)
) ON [PRIMARY]
GO

/****** Object: Table [dbo].[CuaHang] ******/
CREATE TABLE [dbo].[CuaHang](
    [MaCuaHang] [varchar](50) NOT NULL,
    [MaChuShop] [varchar](50) NULL,
    [TenCuaHang] [nvarchar](150) NULL,
    [MoTa] [nvarchar](max) NULL,
    [SoDienThoai] [varchar](30) NULL,
    [DiaChi] [nvarchar](250) NULL,
    [AnhCuaHang] [varchar](300) NULL,
    [TrangThai] [int] NULL,
    [NgayTao] [datetime] NULL,
 CONSTRAINT [PK_CuaHang] PRIMARY KEY CLUSTERED ([MaCuaHang] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object: Table [dbo].[DanhMuc] ******/
CREATE TABLE [dbo].[DanhMuc](
    [MaDanhMuc] [varchar](50) NOT NULL,
    [TenDanhMuc] [nvarchar](150) NULL,
    [MoTa] [nvarchar](250) NULL,
    [TrangThai] [int] NULL,
 CONSTRAINT [PK_DanhMuc] PRIMARY KEY CLUSTERED ([MaDanhMuc] ASC)
) ON [PRIMARY]
GO

/****** Object: Table [dbo].[MonAn] ******/
CREATE TABLE [dbo].[MonAn](
    [MaMonAn] [varchar](50) NOT NULL,
    [MaCuaHang] [varchar](50) NULL,
    [MaDanhMuc] [varchar](50) NULL,
    [TenMonAn] [nvarchar](150) NULL,
    [MoTa] [nvarchar](max) NULL,
    [Gia] [float] NULL,
    [AnhMonAn] [varchar](300) NULL,
    [DanhGia] [float] NULL,
    [TrangThai] [int] NULL,
    [NgayTao] [datetime] NULL,
 CONSTRAINT [PK_MonAn] PRIMARY KEY CLUSTERED ([MaMonAn] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object: Table [dbo].[HinhAnhMonAn] ******/
CREATE TABLE [dbo].[HinhAnhMonAn](
    [MaHinhAnh] [varchar](50) NOT NULL,
    [MaMonAn] [varchar](50) NULL,
    [DuongDanAnh] [varchar](300) NULL,
    [LaAnhChinh] [bit] NULL,
 CONSTRAINT [PK_HinhAnhMonAn] PRIMARY KEY CLUSTERED ([MaHinhAnh] ASC)
) ON [PRIMARY]
GO

/****** Object: Table [dbo].[DiaChi] ******/
CREATE TABLE [dbo].[DiaChi](
    [MaDiaChi] [varchar](50) NOT NULL,
    [MaNguoiDung] [varchar](50) NULL,
    [NguoiNhan] [nvarchar](150) NULL,
    [SoDienThoai] [varchar](30) NULL,
    [DiaChiChiTiet] [nvarchar](250) NULL,
    [PhuongXa] [nvarchar](100) NULL,
    [QuanHuyen] [nvarchar](100) NULL,
    [TinhThanh] [nvarchar](100) NULL,
    [MacDinh] [bit] NULL,
 CONSTRAINT [PK_DiaChi] PRIMARY KEY CLUSTERED ([MaDiaChi] ASC)
) ON [PRIMARY]
GO

/****** Object: Table [dbo].[GioHang] ******/
CREATE TABLE [dbo].[GioHang](
    [MaGioHang] [varchar](50) NOT NULL,
    [MaNguoiDung] [varchar](50) NULL,
    [NgayTao] [datetime] NULL,
    [NgayCapNhat] [datetime] NULL,
 CONSTRAINT [PK_GioHang] PRIMARY KEY CLUSTERED ([MaGioHang] ASC)
) ON [PRIMARY]
GO

/****** Object: Table [dbo].[ChiTietGioHang] ******/
CREATE TABLE [dbo].[ChiTietGioHang](
    [MaChiTietGioHang] [varchar](50) NOT NULL,
    [MaGioHang] [varchar](50) NULL,
    [MaMonAn] [varchar](50) NULL,
    [SoLuong] [int] NULL,
    [Gia] [float] NULL,
 CONSTRAINT [PK_ChiTietGioHang] PRIMARY KEY CLUSTERED ([MaChiTietGioHang] ASC)
) ON [PRIMARY]
GO

/****** Object: Table [dbo].[DonHang] ******/
CREATE TABLE [dbo].[DonHang](
    [MaDonHang] [varchar](50) NOT NULL,
    [MaNguoiDung] [varchar](50) NULL,
    [MaDiaChi] [varchar](50) NULL,
    [TongTien] [float] NULL,
    [PhiGiaoHang] [float] NULL,
    [GiamGia] [float] NULL,
    [ThanhTien] [float] NULL,
    [TrangThai] [int] NULL,
    [NgayDat] [datetime] NULL,
    [GhiChu] [nvarchar](250) NULL,
 CONSTRAINT [PK_DonHang] PRIMARY KEY CLUSTERED ([MaDonHang] ASC)
) ON [PRIMARY]
GO

/****** Object: Table [dbo].[ChiTietDonHang] ******/
CREATE TABLE [dbo].[ChiTietDonHang](
    [MaChiTietDonHang] [varchar](50) NOT NULL,
    [MaDonHang] [varchar](50) NULL,
    [MaMonAn] [varchar](50) NULL,
    [SoLuong] [int] NULL,
    [DonGia] [float] NULL,
    [ThanhTien] [float] NULL,
 CONSTRAINT [PK_ChiTietDonHang] PRIMARY KEY CLUSTERED ([MaChiTietDonHang] ASC)
) ON [PRIMARY]
GO

/****** Object: Table [dbo].[ThanhToan] ******/
CREATE TABLE [dbo].[ThanhToan](
    [MaThanhToan] [varchar](50) NOT NULL,
    [MaDonHang] [varchar](50) NULL,
    [PhuongThuc] [nvarchar](50) NULL,
    [SoTien] [float] NULL,
    [TrangThai] [int] NULL,
    [MaGiaoDich] [varchar](100) NULL,
    [NgayThanhToan] [datetime] NULL,
 CONSTRAINT [PK_ThanhToan] PRIMARY KEY CLUSTERED ([MaThanhToan] ASC)
) ON [PRIMARY]
GO

/****** Object: Table [dbo].[NguoiGiaoHang] ******/
CREATE TABLE [dbo].[NguoiGiaoHang](
    [MaNguoiGiaoHang] [varchar](50) NOT NULL,
    [MaNguoiDung] [varchar](50) NULL,
    [HoTen] [nvarchar](150) NULL,
    [SoDienThoai] [varchar](30) NULL,
    [TrangThai] [int] NULL,
 CONSTRAINT [PK_NguoiGiaoHang] PRIMARY KEY CLUSTERED ([MaNguoiGiaoHang] ASC)
) ON [PRIMARY]
GO

/****** Object: Table [dbo].[GiaoHang] ******/
CREATE TABLE [dbo].[GiaoHang](
    [MaGiaoHang] [varchar](50) NOT NULL,
    [MaDonHang] [varchar](50) NULL,
    [MaNguoiGiaoHang] [varchar](50) NULL,
    [TrangThai] [int] NULL,
    [ThoiGianNhan] [datetime] NULL,
    [ThoiGianGiao] [datetime] NULL,
    [GhiChu] [nvarchar](250) NULL,
 CONSTRAINT [PK_GiaoHang] PRIMARY KEY CLUSTERED ([MaGiaoHang] ASC)
) ON [PRIMARY]
GO

/****** Object: Table [dbo].[DanhGia] ******/
CREATE TABLE [dbo].[DanhGia](
    [MaDanhGia] [varchar](50) NOT NULL,
    [MaNguoiDung] [varchar](50) NULL,
    [MaMonAn] [varchar](50) NULL,
    [MaDonHang] [varchar](50) NULL,
    [SoSao] [int] NULL,
    [NoiDung] [nvarchar](max) NULL,
    [NgayDanhGia] [datetime] NULL,
 CONSTRAINT [PK_DanhGia] PRIMARY KEY CLUSTERED ([MaDanhGia] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object: Table [dbo].[MonAnYeuThich] ******/
CREATE TABLE [dbo].[MonAnYeuThich](
    [MaNguoiDung] [varchar](50) NOT NULL,
    [MaMonAn] [varchar](50) NOT NULL,
    [NgayThem] [datetime] NULL,
 CONSTRAINT [PK_MonAnYeuThich] PRIMARY KEY CLUSTERED ([MaNguoiDung] ASC, [MaMonAn] ASC)
) ON [PRIMARY]
GO

/****** Object: Table [dbo].[LichSuTrangThaiDonHang] ******/
CREATE TABLE [dbo].[LichSuTrangThaiDonHang](
    [MaLichSu] [varchar](50) NOT NULL,
    [MaDonHang] [varchar](50) NULL,
    [TrangThaiCu] [int] NULL,
    [TrangThaiMoi] [int] NULL,
    [MaNguoiThayDoi] [varchar](50) NULL,
    [ThoiGian] [datetime] NULL,
    [GhiChu] [nvarchar](250) NULL,
 CONSTRAINT [PK_LichSuTrangThaiDonHang] PRIMARY KEY CLUSTERED ([MaLichSu] ASC)
) ON [PRIMARY]
GO

/****** Object: Table [dbo].[PhienChat] ******/
CREATE TABLE [dbo].[PhienChat](
    [MaPhienChat] [varchar](50) NOT NULL,
    [MaNguoiDung] [varchar](50) NULL,
    [TieuDe] [nvarchar](150) NULL,
    [NgayTao] [datetime] NULL,
    [NgayCapNhat] [datetime] NULL,
    [TrangThai] [int] NULL,
 CONSTRAINT [PK_PhienChat] PRIMARY KEY CLUSTERED ([MaPhienChat] ASC)
) ON [PRIMARY]
GO

/****** Object: Table [dbo].[TinNhanChat] ******/
CREATE TABLE [dbo].[TinNhanChat](
    [MaTinNhan] [varchar](50) NOT NULL,
    [MaPhienChat] [varchar](50) NULL,
    [VaiNguoiGui] [nvarchar](50) NULL,
    [NoiDung] [nvarchar](max) NULL,
    [ThoiGian] [datetime] NULL,
 CONSTRAINT [PK_TinNhanChat] PRIMARY KEY CLUSTERED ([MaTinNhan] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

--------------------------------------------------
-- 2. TẠO KHÓA NGOẠI (FOREIGN KEYS)
--------------------------------------------------

ALTER TABLE [dbo].[ChiTietDonHang] WITH CHECK ADD CONSTRAINT [FK_ChiTietDonHang_DonHang] FOREIGN KEY([MaDonHang]) REFERENCES [dbo].[DonHang] ([MaDonHang]);
GO
ALTER TABLE [dbo].[ChiTietDonHang] CHECK CONSTRAINT [FK_ChiTietDonHang_DonHang];
GO

ALTER TABLE [dbo].[ChiTietDonHang] WITH CHECK ADD CONSTRAINT [FK_ChiTietDonHang_MonAn] FOREIGN KEY([MaMonAn]) REFERENCES [dbo].[MonAn] ([MaMonAn]);
GO
ALTER TABLE [dbo].[ChiTietDonHang] CHECK CONSTRAINT [FK_ChiTietDonHang_MonAn];
GO

ALTER TABLE [dbo].[MonAn] WITH CHECK ADD CONSTRAINT [FK_MonAn_CuaHang] FOREIGN KEY([MaCuaHang]) REFERENCES [dbo].[CuaHang] ([MaCuaHang]);
GO
ALTER TABLE [dbo].[MonAn] CHECK CONSTRAINT [FK_MonAn_CuaHang];
GO

ALTER TABLE [dbo].[MonAn] WITH CHECK ADD CONSTRAINT [FK_MonAn_DanhMuc] FOREIGN KEY([MaDanhMuc]) REFERENCES [dbo].[DanhMuc] ([MaDanhMuc]);
GO
ALTER TABLE [dbo].[MonAn] CHECK CONSTRAINT [FK_MonAn_DanhMuc];
GO

ALTER TABLE [dbo].[ChiTietGioHang] WITH CHECK ADD CONSTRAINT [FK_ChiTietGioHang_GioHang] FOREIGN KEY([MaGioHang]) REFERENCES [dbo].[GioHang] ([MaGioHang]);
GO
ALTER TABLE [dbo].[ChiTietGioHang] CHECK CONSTRAINT [FK_ChiTietGioHang_GioHang];
GO

--------------------------------------------------
-- 3. CÁC STORED PROCEDURES CHUẨN PHONG CÁCH BANOTO
--------------------------------------------------

/****** Object: StoredProcedure [dbo].[sp_nguoi_dung_create] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_nguoi_dung_create]
(
 @MaNguoiDung varchar(50), 
 @HoTen nvarchar(150),
 @Email varchar(150),
 @MatKhau varchar(150),
 @SoDienThoai varchar(30),
 @AnhDaiDien varchar(300),
 @TrangThai int
)
AS
    BEGIN
      INSERT INTO [NguoiDung]
                (
                 MaNguoiDung, 
                 HoTen, 
                 Email, 
                 MatKhau, 
                 SoDienThoai, 
                 AnhDaiDien, 
                 TrangThai, 
                 NgayTao
                )
                VALUES
                (
                 @MaNguoiDung, 
                 @HoTen, 
                 @Email, 
                 @MatKhau, 
                 @SoDienThoai, 
                 @AnhDaiDien, 
                 @TrangThai, 
                 GETDATE()
                );
        SELECT '';
    END;
GO

/****** Object: StoredProcedure [dbo].[sp_mon_an_search] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_mon_an_search] 
(
 @page_index INT, 
 @page_size INT,
 @TenMonAn NVARCHAR(150),
 @MaDanhMuc VARCHAR(50)
)
AS
    BEGIN
        DECLARE @RecordCount BIGINT;
        IF(@page_size <> 0)
            BEGIN
                SET NOCOUNT ON;
                        SELECT(ROW_NUMBER() OVER(
                              ORDER BY TenMonAn ASC)) AS RowNumber, 
                              m.MaMonAn, 
                              m.MaCuaHang, 
                              m.MaDanhMuc,
                              m.TenMonAn, 
                              m.Gia,
                              m.AnhMonAn,
                              m.DanhGia,
                              m.TrangThai                             
                        INTO #Results1
                        FROM [MonAn] AS m
                        WHERE (@TenMonAn = '' OR m.TenMonAn LIKE N'%'+@TenMonAn+'%') AND	
                              (@MaDanhMuc = '' OR @MaDanhMuc IS NULL OR m.MaDanhMuc = @MaDanhMuc);                  
                        SELECT @RecordCount = COUNT(*) FROM #Results1;
                        SELECT *, 
                               @RecordCount AS RecordCount
                        FROM #Results1
                        WHERE ROWNUMBER BETWEEN(@page_index - 1) * @page_size + 1 AND(((@page_index - 1) * @page_size + 1) + @page_size) - 1
                              OR @page_index = -1;
                        DROP TABLE #Results1; 
            END;
            ELSE
            BEGIN
                SET NOCOUNT ON;
                        SELECT(ROW_NUMBER() OVER(
                              ORDER BY TenMonAn ASC)) AS RowNumber, 
                              m.MaMonAn, 
                              m.MaCuaHang, 
                              m.MaDanhMuc,
                              m.TenMonAn, 
                              m.Gia,
                              m.AnhMonAn,
                              m.DanhGia,
                              m.TrangThai                                
                        INTO #Results2
                        FROM [MonAn] AS m
                        WHERE (@TenMonAn = '' OR m.TenMonAn LIKE N'%'+@TenMonAn+'%') AND	
                              (@MaDanhMuc = '' OR @MaDanhMuc IS NULL OR m.MaDanhMuc = @MaDanhMuc);                        
                        SELECT @RecordCount = COUNT(*) FROM #Results2;
                        SELECT *, 
                               @RecordCount AS RecordCount
                        FROM #Results2;
                        DROP TABLE #Results2;
        END;
    END;
GO

/****** Object: StoredProcedure [dbo].[sp_don_hang_create] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_don_hang_create]
(
 @MaDonHang VARCHAR(50), 
 @MaNguoiDung VARCHAR(50), 
 @MaDiaChi VARCHAR(50),
 @TongTien FLOAT,
 @PhiGiaoHang FLOAT,
 @GiamGia FLOAT,
 @ThanhTien FLOAT,
 @GhiChu NVARCHAR(250),
 @listjson_chitiet NVARCHAR(MAX)
)
AS
    BEGIN
        INSERT INTO DonHang
                (
                 MaDonHang, 
                 MaNguoiDung, 
                 MaDiaChi,
                 TongTien,
                 PhiGiaoHang,
                 GiamGia,
                 ThanhTien,
                 TrangThai,
                 NgayDat,
                 GhiChu               
                )
                VALUES
                (
                 @MaDonHang, 
                 @MaNguoiDung, 
                 @MaDiaChi,
                 @TongTien,
                 @PhiGiaoHang,
                 @GiamGia,
                 @ThanhTien,
                 1, -- 1: Mới đặt
                 GETDATE(),
                 @GhiChu
                );
        IF(@listjson_chitiet IS NOT NULL)
            BEGIN
                INSERT INTO ChiTietDonHang
                (
                 MaChiTietDonHang, 
                 MaDonHang, 
                 MaMonAn, 
                 SoLuong,
                 DonGia,
                 ThanhTien                       
                )
                SELECT 
                 JSON_VALUE(p.value, '$.MaChiTietDonHang'), 
                 @MaDonHang, 
                 JSON_VALUE(p.value, '$.MaMonAn'), 
                 JSON_VALUE(p.value, '$.SoLuong'),
                 JSON_VALUE(p.value, '$.DonGia'),
                 JSON_VALUE(p.value, '$.ThanhTien')    
                FROM OPENJSON(@listjson_chitiet) AS p;
        END;
        SELECT '';
    END;
GO

/****** Object: StoredProcedure [dbo].[sp_don_hang_get_by_id] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_don_hang_get_by_id](@MaDonHang VARCHAR(50))
AS
    BEGIN
        SELECT d.MaDonHang, 
               d.MaNguoiDung, 
               d.MaDiaChi,
               d.TongTien,
               d.PhiGiaoHang,
               d.GiamGia,
               d.ThanhTien,
               d.TrangThai,
               d.NgayDat,
               d.GhiChu,
               (
                   SELECT 
                       c.MaChiTietDonHang,
                       c.MaDonHang,
                       c.MaMonAn,
                       c.SoLuong,
                       c.DonGia,
                       c.ThanhTien,
                       m.TenMonAn,
                       m.AnhMonAn
                   FROM ChiTietDonHang AS c
                   JOIN MonAn m ON c.MaMonAn = m.MaMonAn
                   WHERE c.MaDonHang = d.MaDonHang FOR JSON PATH
               ) AS listjson_chitiet
        FROM DonHang d
        WHERE d.MaDonHang = @MaDonHang;
    END;
GO

/****** Object: StoredProcedure [dbo].[sp_don_hang_update] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_don_hang_update]
(
 @MaDonHang VARCHAR(50), 
 @TrangThai INT,
 @GhiChu NVARCHAR(250),  
 @listjson_chitiet NVARCHAR(MAX)
)
AS
    BEGIN
        UPDATE DonHang
        SET
            TrangThai = @TrangThai,
            GhiChu = @GhiChu
        WHERE MaDonHang = @MaDonHang;
        
        IF(@listjson_chitiet IS NOT NULL) 
        BEGIN
           SELECT
              JSON_VALUE(p.value, '$.MaChiTietDonHang') as MaChiTietDonHang,
              JSON_VALUE(p.value, '$.MaMonAn') as MaMonAn,
              JSON_VALUE(p.value, '$.SoLuong') as SoLuong,
              JSON_VALUE(p.value, '$.DonGia') as DonGia,
              JSON_VALUE(p.value, '$.ThanhTien') as ThanhTien,
              JSON_VALUE(p.value, '$.status') AS status 
              INTO #Results 
           FROM OPENJSON(@listjson_chitiet) AS p;
         
           -- Thêm dòng mới (status = '1')
            INSERT INTO ChiTietDonHang (MaChiTietDonHang, MaDonHang, MaMonAn, SoLuong, DonGia, ThanhTien) 
            SELECT
               #Results.MaChiTietDonHang,
               @MaDonHang,
               #Results.MaMonAn,
               #Results.SoLuong,
               #Results.DonGia,
               #Results.ThanhTien			 
            FROM #Results 
            WHERE #Results.status = '1';
            
           -- Cập nhật số lượng/giá (status = '2')
            UPDATE ChiTietDonHang 
            SET
               SoLuong = #Results.SoLuong,
               DonGia = #Results.DonGia,
               ThanhTien = #Results.ThanhTien
            FROM #Results 
            WHERE ChiTietDonHang.MaChiTietDonHang = #Results.MaChiTietDonHang AND #Results.status = '2';
            
           -- Xóa chi tiết (status = '3')
            DELETE C
            FROM ChiTietDonHang C
            INNER JOIN #Results R ON C.MaChiTietDonHang = R.MaChiTietDonHang
            WHERE R.status = '3';
            
            DROP TABLE #Results;
        END;
        SELECT '';
    END;
GO

/****** Object: StoredProcedure [dbo].[sp_don_hang_delete] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_don_hang_delete]
(
 @MaDonHang VARCHAR(50) 
)
AS
    BEGIN
        DELETE FROM [ChiTietDonHang] WHERE MaDonHang = @MaDonHang;
        DELETE FROM [DonHang] WHERE MaDonHang = @MaDonHang;
        SELECT '';
    END;
GO

--------------------------------------------------
-- 4. DỮ LIỆU MẪU (SEED DATA & PHÂN QUYỀN)
--------------------------------------------------

-- Bảng VaiTro
IF NOT EXISTS (SELECT 1 FROM [dbo].[VaiTro] WHERE [MaVaiTro] = 'Admin')
    INSERT INTO [dbo].[VaiTro] ([MaVaiTro], [TenVaiTro]) VALUES ('Admin', N'Quản trị viên');
IF NOT EXISTS (SELECT 1 FROM [dbo].[VaiTro] WHERE [MaVaiTro] = 'ChuShop')
    INSERT INTO [dbo].[VaiTro] ([MaVaiTro], [TenVaiTro]) VALUES ('ChuShop', N'Chủ shop');
IF NOT EXISTS (SELECT 1 FROM [dbo].[VaiTro] WHERE [MaVaiTro] = 'KhachHang')
    INSERT INTO [dbo].[VaiTro] ([MaVaiTro], [TenVaiTro]) VALUES ('KhachHang', N'Khách hàng');
GO

-- Bảng NguoiDung (Mật khẩu mẫu: 123456)
IF NOT EXISTS (SELECT 1 FROM [dbo].[NguoiDung] WHERE [MaNguoiDung] = 'ND_ADMIN01')
    INSERT INTO [dbo].[NguoiDung] ([MaNguoiDung], [HoTen], [Email], [MatKhau], [SoDienThoai], [AnhDaiDien], [TrangThai], [NgayTao])
    VALUES ('ND_ADMIN01', N'Nguyễn Văn Quản Trị', 'admin@fooddeli.com', '123456', '0901234567', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin', 1, GETDATE());

IF NOT EXISTS (SELECT 1 FROM [dbo].[NguoiDung] WHERE [MaNguoiDung] = 'ND_CHUSHOP01')
    INSERT INTO [dbo].[NguoiDung] ([MaNguoiDung], [HoTen], [Email], [MatKhau], [SoDienThoai], [AnhDaiDien], [TrangThai], [NgayTao])
    VALUES ('ND_CHUSHOP01', N'Trần Thị Chủ Quán', 'chushop@fooddeli.com', '123456', '0912345678', 'https://api.dicebear.com/7.x/bottts/svg?seed=shop', 1, GETDATE());

IF NOT EXISTS (SELECT 1 FROM [dbo].[NguoiDung] WHERE [MaNguoiDung] = 'ND_KHACH01')
    INSERT INTO [dbo].[NguoiDung] ([MaNguoiDung], [HoTen], [Email], [MatKhau], [SoDienThoai], [AnhDaiDien], [TrangThai], [NgayTao])
    VALUES ('ND_KHACH01', N'Lê Văn Khách Hàng', 'khachhang@fooddeli.com', '123456', '0923456789', 'https://api.dicebear.com/7.x/bottts/svg?seed=customer', 1, GETDATE());
GO

-- Bảng NguoiDung_VaiTro
IF NOT EXISTS (SELECT 1 FROM [dbo].[NguoiDung_VaiTro] WHERE [MaNguoiDung] = 'ND_ADMIN01' AND [MaVaiTro] = 'Admin')
    INSERT INTO [dbo].[NguoiDung_VaiTro] ([MaNguoiDung], [MaVaiTro]) VALUES ('ND_ADMIN01', 'Admin');

IF NOT EXISTS (SELECT 1 FROM [dbo].[NguoiDung_VaiTro] WHERE [MaNguoiDung] = 'ND_CHUSHOP01' AND [MaVaiTro] = 'ChuShop')
    INSERT INTO [dbo].[NguoiDung_VaiTro] ([MaNguoiDung], [MaVaiTro]) VALUES ('ND_CHUSHOP01', 'ChuShop');

IF NOT EXISTS (SELECT 1 FROM [dbo].[NguoiDung_VaiTro] WHERE [MaNguoiDung] = 'ND_KHACH01' AND [MaVaiTro] = 'KhachHang')
    INSERT INTO [dbo].[NguoiDung_VaiTro] ([MaNguoiDung], [MaVaiTro]) VALUES ('ND_KHACH01', 'KhachHang');
GO

-- Bảng DanhMuc mẫu
IF NOT EXISTS (SELECT 1 FROM [dbo].[DanhMuc] WHERE [MaDanhMuc] = 'DM_COM')
    INSERT INTO [dbo].[DanhMuc] ([MaDanhMuc], [TenDanhMuc], [MoTa], [TrangThai]) VALUES ('DM_COM', N'Cơm & Món mặn', N'Cơm tấm, cơm gà, cơm sườn...', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[DanhMuc] WHERE [MaDanhMuc] = 'DM_DOUONG')
    INSERT INTO [dbo].[DanhMuc] ([MaDanhMuc], [TenDanhMuc], [MoTa], [TrangThai]) VALUES ('DM_DOUONG', N'Trà sữa & Đồ uống', N'Trà sữa trân châu, cà phê, nước ép...', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[DanhMuc] WHERE [MaDanhMuc] = 'DM_BUNPHO')
    INSERT INTO [dbo].[DanhMuc] ([MaDanhMuc], [TenDanhMuc], [MoTa], [TrangThai]) VALUES ('DM_BUNPHO', N'Bún, Phở, Mì', N'Phở bò, bún bò Huế, mì Quảng...', 1);
GO

-- Bảng CuaHang mẫu
IF NOT EXISTS (SELECT 1 FROM [dbo].[CuaHang] WHERE [MaCuaHang] = 'CH01')
    INSERT INTO [dbo].[CuaHang] ([MaCuaHang], [MaChuShop], [TenCuaHang], [MoTa], [SoDienThoai], [DiaChi], [AnhCuaHang], [TrangThai], [NgayTao])
    VALUES ('CH01', 'ND_CHUSHOP01', N'Bếp Cơm Ngon Mẹ Nấu', N'Chuyên cơm trưa văn phòng, cơm tấm sườn nướng chuẩn vị', '0912345678', N'123 Nguyễn Trãi, Thanh Xuân, Hà Nội', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5', 1, GETDATE());
GO

-- Bảng MonAn mẫu
IF NOT EXISTS (SELECT 1 FROM [dbo].[MonAn] WHERE [MaMonAn] = 'MA01')
    INSERT INTO [dbo].[MonAn] ([MaMonAn], [MaCuaHang], [MaDanhMuc], [TenMonAn], [MoTa], [Gia], [AnhMonAn], [DanhGia], [TrangThai], [NgayTao])
    VALUES ('MA01', 'CH01', 'DM_COM', N'Cơm Tấm Sườn Bì Chả', N'Sườn nướng mật ong thơm lừng kèm bì chả trứng hấp', 45000, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', 5.0, 1, GETDATE());

IF NOT EXISTS (SELECT 1 FROM [dbo].[MonAn] WHERE [MaMonAn] = 'MA02')
    INSERT INTO [dbo].[MonAn] ([MaMonAn], [MaCuaHang], [MaDanhMuc], [TenMonAn], [MoTa], [Gia], [AnhMonAn], [DanhGia], [TrangThai], [NgayTao])
    VALUES ('MA02', 'CH01', 'DM_COM', N'Cơm Gà Xối Mỡ Da Giòn', N'Gà ta thả vườn rán giòn rụm kèm nước sốt đặc biệt', 50000, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b', 4.8, 1, GETDATE());

IF NOT EXISTS (SELECT 1 FROM [dbo].[MonAn] WHERE [MaMonAn] = 'MA03')
    INSERT INTO [dbo].[MonAn] ([MaMonAn], [MaCuaHang], [MaDanhMuc], [TenMonAn], [MoTa], [Gia], [AnhMonAn], [DanhGia], [TrangThai], [NgayTao])
    VALUES ('MA03', 'CH01', 'DM_DOUONG', N'Trà Sữa Trân Châu Đường Đen', N'Trà sữa đậm đà kèm trân châu hoàng kim nấu đường nâu', 30000, 'https://images.unsplash.com/photo-1558857563-b37fe4ffbe49', 4.9, 1, GETDATE());
GO

--------------------------------------------------
-- 5. SPRINT 5 STORED PROCEDURES
--------------------------------------------------

/****** Object: StoredProcedure [dbo].[sp_don_hang_update_trang_thai] ******/
CREATE OR ALTER PROCEDURE [dbo].[sp_don_hang_update_trang_thai]
(
    @MaDonHang VARCHAR(50),
    @TrangThai NVARCHAR(50)
)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE DonHang
    SET TrangThai = @TrangThai
    WHERE MaDonHang = @MaDonHang;
    SELECT '';
END;
GO

/****** Object: StoredProcedure [dbo].[sp_thong_ke_doanh_thu] ******/
CREATE OR ALTER PROCEDURE [dbo].[sp_thong_ke_doanh_thu]
(
    @TuNgay DATETIME = NULL,
    @DenNgay DATETIME = NULL,
    @LoaiThoiGian NVARCHAR(20) = 'ngay', -- 'ngay', 'tuan', 'thang'
    @MaCuaHang VARCHAR(50) = NULL
)
AS
BEGIN
    SET NOCOUNT ON;

    IF @TuNgay IS NULL
        SET @TuNgay = DATEADD(DAY, -30, GETDATE());

    IF @DenNgay IS NULL
        SET @DenNgay = GETDATE();

    SET @DenNgay = DATEADD(SECOND, -1, DATEADD(DAY, 1, CAST(CAST(@DenNgay AS DATE) AS DATETIME)));

    IF LOWER(@LoaiThoiGian) = 'thang'
    BEGIN
        SELECT 
            FORMAT(d.NgayDat, 'yyyy-MM') AS MocThoiGian,
            COUNT(DISTINCT d.MaDonHang) AS SoDonHang,
            SUM(ISNULL(d.ThanhTien, 0)) AS TongDoanhThu,
            SUM(CASE WHEN d.TrangThai IN ('Hoàn thành', '4', 'Đã giao') THEN ISNULL(d.ThanhTien, 0) ELSE 0 END) AS DoanhThuThucTe,
            SUM(CASE WHEN d.TrangThai IN ('Hoàn thành', '4', 'Đã giao') THEN 1 ELSE 0 END) AS SoDonThanhCong,
            SUM(CASE WHEN d.TrangThai IN ('Đã hủy', '5', '0') THEN 1 ELSE 0 END) AS SoDonHuy
        FROM DonHang d
        WHERE d.NgayDat BETWEEN @TuNgay AND @DenNgay
          AND (@MaCuaHang IS NULL OR EXISTS (
                SELECT 1 FROM ChiTietDonHang ct 
                JOIN MonAn m ON ct.MaMonAn = m.MaMonAn 
                WHERE ct.MaDonHang = d.MaDonHang AND m.MaCuaHang = @MaCuaHang
          ))
        GROUP BY FORMAT(d.NgayDat, 'yyyy-MM')
        ORDER BY MocThoiGian ASC;
    END
    ELSE IF LOWER(@LoaiThoiGian) = 'tuan'
    BEGIN
        SELECT 
            CONCAT(YEAR(d.NgayDat), '-W', DATEPART(WEEK, d.NgayDat)) AS MocThoiGian,
            COUNT(DISTINCT d.MaDonHang) AS SoDonHang,
            SUM(ISNULL(d.ThanhTien, 0)) AS TongDoanhThu,
            SUM(CASE WHEN d.TrangThai IN ('Hoàn thành', '4', 'Đã giao') THEN ISNULL(d.ThanhTien, 0) ELSE 0 END) AS DoanhThuThucTe,
            SUM(CASE WHEN d.TrangThai IN ('Hoàn thành', '4', 'Đã giao') THEN 1 ELSE 0 END) AS SoDonThanhCong,
            SUM(CASE WHEN d.TrangThai IN ('Đã hủy', '5', '0') THEN 1 ELSE 0 END) AS SoDonHuy
        FROM DonHang d
        WHERE d.NgayDat BETWEEN @TuNgay AND @DenNgay
          AND (@MaCuaHang IS NULL OR EXISTS (
                SELECT 1 FROM ChiTietDonHang ct 
                JOIN MonAn m ON ct.MaMonAn = m.MaMonAn 
                WHERE ct.MaDonHang = d.MaDonHang AND m.MaCuaHang = @MaCuaHang
          ))
        GROUP BY CONCAT(YEAR(d.NgayDat), '-W', DATEPART(WEEK, d.NgayDat))
        ORDER BY MocThoiGian ASC;
    END
    ELSE
    BEGIN
        SELECT 
            CONVERT(VARCHAR(10), d.NgayDat, 120) AS MocThoiGian,
            COUNT(DISTINCT d.MaDonHang) AS SoDonHang,
            SUM(ISNULL(d.ThanhTien, 0)) AS TongDoanhThu,
            SUM(CASE WHEN d.TrangThai IN ('Hoàn thành', '4', 'Đã giao') THEN ISNULL(d.ThanhTien, 0) ELSE 0 END) AS DoanhThuThucTe,
            SUM(CASE WHEN d.TrangThai IN ('Hoàn thành', '4', 'Đã giao') THEN 1 ELSE 0 END) AS SoDonThanhCong,
            SUM(CASE WHEN d.TrangThai IN ('Đã hủy', '5', '0') THEN 1 ELSE 0 END) AS SoDonHuy
        FROM DonHang d
        WHERE d.NgayDat BETWEEN @TuNgay AND @DenNgay
          AND (@MaCuaHang IS NULL OR EXISTS (
                SELECT 1 FROM ChiTietDonHang ct 
                JOIN MonAn m ON ct.MaMonAn = m.MaMonAn 
                WHERE ct.MaDonHang = d.MaDonHang AND m.MaCuaHang = @MaCuaHang
          ))
        GROUP BY CONVERT(VARCHAR(10), d.NgayDat, 120)
        ORDER BY MocThoiGian ASC;
    END
END;
GO

/****** Object: StoredProcedure [dbo].[sp_thong_ke_top_mon_an] ******/
CREATE OR ALTER PROCEDURE [dbo].[sp_thong_ke_top_mon_an]
(
    @Top INT = 5,
    @TuNgay DATETIME = NULL,
    @DenNgay DATETIME = NULL,
    @MaCuaHang VARCHAR(50) = NULL
)
AS
BEGIN
    SET NOCOUNT ON;

    IF @Top IS NULL OR @Top <= 0
        SET @Top = 5;

    IF @TuNgay IS NULL
        SET @TuNgay = DATEADD(DAY, -30, GETDATE());

    IF @DenNgay IS NULL
        SET @DenNgay = GETDATE();

    SET @DenNgay = DATEADD(SECOND, -1, DATEADD(DAY, 1, CAST(CAST(@DenNgay AS DATE) AS DATETIME)));

    SELECT TOP (@Top)
        m.MaMonAn,
        m.TenMonAn,
        m.AnhMonAn,
        m.Gia,
        m.MaCuaHang,
        ch.TenCuaHang,
        dm.TenDanhMuc,
        ISNULL(SUM(ct.SoLuong), 0) AS TongSoLuongBan,
        ISNULL(SUM(ct.ThanhTien), 0) AS TongDoanhThu,
        ISNULL(AVG(dg.SoSao), 5.0) AS DiemDanhGiaTrungBinh,
        COUNT(DISTINCT dg.MaDanhGia) AS SoLuotDanhGia
    FROM ChiTietDonHang ct
    JOIN DonHang d ON ct.MaDonHang = d.MaDonHang
    JOIN MonAn m ON ct.MaMonAn = m.MaMonAn
    LEFT JOIN CuaHang ch ON m.MaCuaHang = ch.MaCuaHang
    LEFT JOIN DanhMuc dm ON m.MaDanhMuc = dm.MaDanhMuc
    LEFT JOIN DanhGia dg ON m.MaMonAn = dg.MaMonAn
    WHERE d.NgayDat BETWEEN @TuNgay AND @DenNgay
      AND (@MaCuaHang IS NULL OR m.MaCuaHang = @MaCuaHang)
    GROUP BY m.MaMonAn, m.TenMonAn, m.AnhMonAn, m.Gia, m.MaCuaHang, ch.TenCuaHang, dm.TenDanhMuc
    ORDER BY TongSoLuongBan DESC, TongDoanhThu DESC;
END;
GO