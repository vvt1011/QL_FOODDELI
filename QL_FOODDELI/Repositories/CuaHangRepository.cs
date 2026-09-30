using Dapper;
using QL_FOODDELI.Data;
using QL_FOODDELI.Models;

namespace QL_FOODDELI.Repositories
{
    public class CuaHangRepository : ICuaHangRepository
    {
        private readonly DapperContext _context;

        public CuaHangRepository(DapperContext context)
        {
            _context = context;
        }

        // =====================================================
        // LẤY TẤT CẢ CỬA HÀNG
        // =====================================================
        public async Task<IEnumerable<CuaHang>> GetAllAsync()
        {
            const string sql = @"
                SELECT *
                FROM CuaHang
                ORDER BY NgayTao DESC";

            using var conn = _context.CreateConnection();

            return await conn.QueryAsync<CuaHang>(sql);
        }

        // =====================================================
        // LẤY CỬA HÀNG THEO ID
        // =====================================================
        public async Task<CuaHang?> GetByIdAsync(
            string maCuaHang)
        {
            if (string.IsNullOrWhiteSpace(maCuaHang))
                return null;

            const string sql = @"
                SELECT *
                FROM CuaHang
                WHERE MaCuaHang = @MaCuaHang";

            using var conn = _context.CreateConnection();

            return await conn.QueryFirstOrDefaultAsync<CuaHang>(
                sql,
                new
                {
                    MaCuaHang = maCuaHang
                });
        }

        // =====================================================
        // LẤY CỬA HÀNG THEO CHỦ SHOP
        // =====================================================
        public async Task<IEnumerable<CuaHang>> GetByChuShopAsync(
            string maChuShop)
        {
            if (string.IsNullOrWhiteSpace(maChuShop))
                return Enumerable.Empty<CuaHang>();

            const string sql = @"
                SELECT *
                FROM CuaHang
                WHERE MaChuShop = @MaChuShop
                ORDER BY NgayTao DESC";

            using var conn = _context.CreateConnection();

            return await conn.QueryAsync<CuaHang>(
                sql,
                new
                {
                    MaChuShop = maChuShop
                });
        }

        // =====================================================
        // TẠO CỬA HÀNG
        // =====================================================
        public async Task<bool> CreateAsync(
            CuaHang cuaHang)
        {
            if (cuaHang == null ||
                string.IsNullOrWhiteSpace(cuaHang.MaCuaHang))
            {
                return false;
            }

            const string sql = @"
                INSERT INTO CuaHang
                (
                    MaCuaHang,
                    MaChuShop,
                    TenCuaHang,
                    MoTa,
                    SoDienThoai,
                    DiaChi,
                    AnhCuaHang,
                    TrangThai,
                    NgayTao
                )
                VALUES
                (
                    @MaCuaHang,
                    @MaChuShop,
                    @TenCuaHang,
                    @MoTa,
                    @SoDienThoai,
                    @DiaChi,
                    @AnhCuaHang,
                    @TrangThai,
                    GETDATE()
                )";

            using var conn = _context.CreateConnection();

            try
            {
                var rows = await conn.ExecuteAsync(
                    sql,
                    cuaHang);

                return rows > 0;
            }
            catch
            {
                return false;
            }
        }

        // =====================================================
        // CẬP NHẬT CỬA HÀNG
        // =====================================================
        public async Task<bool> UpdateAsync(
            CuaHang cuaHang)
        {
            if (cuaHang == null ||
                string.IsNullOrWhiteSpace(cuaHang.MaCuaHang))
            {
                return false;
            }

            const string sql = @"
                UPDATE CuaHang
                SET
                    TenCuaHang = @TenCuaHang,
                    MoTa = @MoTa,
                    SoDienThoai = @SoDienThoai,
                    DiaChi = @DiaChi,
                    AnhCuaHang = @AnhCuaHang,
                    TrangThai = @TrangThai
                WHERE MaCuaHang = @MaCuaHang";

            using var conn = _context.CreateConnection();

            var rows = await conn.ExecuteAsync(
                sql,
                cuaHang);

            return rows > 0;
        }

        // =====================================================
        // XÓA CỬA HÀNG
        // =====================================================
        public async Task<bool> DeleteAsync(
            string maCuaHang)
        {
            if (string.IsNullOrWhiteSpace(maCuaHang))
                return false;

            const string sql = @"
                DELETE FROM CuaHang
                WHERE MaCuaHang = @MaCuaHang";

            using var conn = _context.CreateConnection();

            var rows = await conn.ExecuteAsync(
                sql,
                new
                {
                    MaCuaHang = maCuaHang
                });

            return rows > 0;
        }
    }
}