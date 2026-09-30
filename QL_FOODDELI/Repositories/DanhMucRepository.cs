using Dapper;
using QL_FOODDELI.Data;
using QL_FOODDELI.Models;

namespace QL_FOODDELI.Repositories
{
    public class DanhMucRepository : IDanhMucRepository
    {
        private readonly DapperContext _context;

        public DanhMucRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DanhMuc>> GetAllAsync()
        {
            const string sql = "SELECT * FROM DanhMuc ORDER BY TenDanhMuc ASC";
            using var conn = _context.CreateConnection();
            return await conn.QueryAsync<DanhMuc>(sql);
        }

        public async Task<DanhMuc?> GetByIdAsync(string maDanhMuc)
        {
            const string sql = "SELECT * FROM DanhMuc WHERE MaDanhMuc = @MaDanhMuc";
            using var conn = _context.CreateConnection();
            return await conn.QueryFirstOrDefaultAsync<DanhMuc>(sql, new { MaDanhMuc = maDanhMuc });
        }

        public async Task<bool> CreateAsync(DanhMuc danhMuc)
        {
            const string sql = @"
                INSERT INTO DanhMuc (MaDanhMuc, TenDanhMuc, MoTa, TrangThai)
                VALUES (@MaDanhMuc, @TenDanhMuc, @MoTa, @TrangThai)";

            using var conn = _context.CreateConnection();
            var rows = await conn.ExecuteAsync(sql, danhMuc);
            return rows > 0;
        }

        public async Task<bool> UpdateAsync(DanhMuc danhMuc)
        {
            const string sql = @"
                UPDATE DanhMuc
                SET TenDanhMuc = @TenDanhMuc,
                    MoTa = @MoTa,
                    TrangThai = @TrangThai
                WHERE MaDanhMuc = @MaDanhMuc";

            using var conn = _context.CreateConnection();
            var rows = await conn.ExecuteAsync(sql, danhMuc);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(string maDanhMuc)
        {
            const string sql = "DELETE FROM DanhMuc WHERE MaDanhMuc = @MaDanhMuc";
            using var conn = _context.CreateConnection();
            var rows = await conn.ExecuteAsync(sql, new { MaDanhMuc = maDanhMuc });
            return rows > 0;
        }
    }
}
