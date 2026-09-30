using Dapper;
using QL_FOODDELI.Data;
using QL_FOODDELI.DTOs;
using System.Data;

namespace QL_FOODDELI.Repositories
{
    public class ThongKeRepository : IThongKeRepository
    {
        private readonly DapperContext _context;

        public ThongKeRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DoanhThuTheoThoiGianDto>> GetDoanhThuAsync(DateTime? tuNgay, DateTime? denNgay, string loai, string? maCuaHang = null)
        {
            using var conn = _context.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@TuNgay", tuNgay);
            parameters.Add("@DenNgay", denNgay);
            parameters.Add("@LoaiThoiGian", string.IsNullOrWhiteSpace(loai) ? "ngay" : loai);
            parameters.Add("@MaCuaHang", maCuaHang);

            return await conn.QueryAsync<DoanhThuTheoThoiGianDto>(
                "sp_thong_ke_doanh_thu",
                parameters,
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<TopMonAnDto>> GetTopMonAnAsync(int top, DateTime? tuNgay, DateTime? denNgay, string? maCuaHang = null)
        {
            using var conn = _context.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@Top", top <= 0 ? 5 : top);
            parameters.Add("@TuNgay", tuNgay);
            parameters.Add("@DenNgay", denNgay);
            parameters.Add("@MaCuaHang", maCuaHang);

            return await conn.QueryAsync<TopMonAnDto>(
                "sp_thong_ke_top_mon_an",
                parameters,
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<ThongKeTongQuanDto> GetTongQuanAsync(string? maCuaHang = null)
        {
            using var conn = _context.CreateConnection();

            string sql = @"
                SELECT 
                    COUNT(DISTINCT d.MaDonHang) AS TongSoDonHang,
                    ISNULL(SUM(d.ThanhTien), 0) AS TongDoanhThu,
                    ISNULL(SUM(CASE WHEN d.TrangThai IN ('Hoàn thành', '4', 'Đã giao') THEN d.ThanhTien ELSE 0 END), 0) AS DoanhThuThucTe,
                    ISNULL(SUM(CASE WHEN d.TrangThai IN ('Hoàn thành', '4', 'Đã giao') THEN 1 ELSE 0 END), 0) AS SoDonThanhCong,
                    ISNULL(SUM(CASE WHEN d.TrangThai IN ('Đã hủy', '5', '0') THEN 1 ELSE 0 END), 0) AS SoDonHuy
                FROM DonHang d
                WHERE (@MaCuaHang IS NULL OR EXISTS (
                    SELECT 1 FROM ChiTietDonHang ct 
                    JOIN MonAn m ON ct.MaMonAn = m.MaMonAn 
                    WHERE ct.MaDonHang = d.MaDonHang AND m.MaCuaHang = @MaCuaHang
                ));

                SELECT COUNT(DISTINCT nd.MaNguoiDung) 
                FROM NguoiDung nd
                JOIN NguoiDung_VaiTro nvt ON nd.MaNguoiDung = nvt.MaNguoiDung
                WHERE nvt.MaVaiTro = 'KhachHang';

                SELECT COUNT(1) FROM MonAn WHERE (@MaCuaHang IS NULL OR MaCuaHang = @MaCuaHang);

                SELECT COUNT(1) FROM CuaHang WHERE (@MaCuaHang IS NULL OR MaCuaHang = @MaCuaHang);
            ";

            using var multi = await conn.QueryMultipleAsync(sql, new { MaCuaHang = maCuaHang });
            var result = await multi.ReadFirstOrDefaultAsync<ThongKeTongQuanDto>() ?? new ThongKeTongQuanDto();
            result.TongSoKhachHang = await multi.ReadFirstOrDefaultAsync<int>();
            result.TongSoMonAn = await multi.ReadFirstOrDefaultAsync<int>();
            result.TongSoCuaHang = await multi.ReadFirstOrDefaultAsync<int>();

            return result;
        }
    }
}
