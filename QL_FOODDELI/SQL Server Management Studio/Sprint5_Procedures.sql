USE QL_Delivery;
GO

-- 1. Cập nhật kiểu dữ liệu cột bảng LichSuTrangThaiDonHang
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'LichSuTrangThaiDonHang' AND COLUMN_NAME = 'TrangThaiCu' AND DATA_TYPE = 'int')
BEGIN
    ALTER TABLE LichSuTrangThaiDonHang ALTER COLUMN TrangThaiCu NVARCHAR(100);
END
GO

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'LichSuTrangThaiDonHang' AND COLUMN_NAME = 'TrangThaiMoi' AND DATA_TYPE = 'int')
BEGIN
    ALTER TABLE LichSuTrangThaiDonHang ALTER COLUMN TrangThaiMoi NVARCHAR(100);
END
GO

-- 2. Stored Procedure: sp_thong_ke_doanh_thu
-- Thống kê tổng tiền, số đơn hàng theo khoảng thời gian (ngày, tuần, tháng) và theo cửa hàng (tùy chọn)
CREATE OR ALTER PROCEDURE dbo.sp_thong_ke_doanh_thu
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

-- 3. Stored Procedure: sp_thong_ke_top_mon_an
-- Lấy danh sách Top món ăn bán chạy nhất
CREATE OR ALTER PROCEDURE dbo.sp_thong_ke_top_mon_an
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
