using Dapper;
using QL_FOODDELI.Data;
using QL_FOODDELI.DTOs;
using QL_FOODDELI.Models;
using System.Data;

namespace QL_FOODDELI.Repositories
{
    public class MonAnRepository : IMonAnRepository
    {
        private readonly DapperContext _context;

        public MonAnRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<MonAnSearchResponse> SearchAsync(MonAnSearchRequest request)
        {
            using var conn = _context.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@page_index", request.PageIndex);
            parameters.Add("@page_size", request.PageSize);
            parameters.Add("@TenMonAn", request.TenMonAn ?? string.Empty);
            parameters.Add("@MaDanhMuc", request.MaDanhMuc ?? string.Empty);

            var items = (await conn.QueryAsync<MonAn>(
                "sp_mon_an_search",
                parameters,
                commandType: CommandType.StoredProcedure
            )).ToList();

            long totalCount = items.FirstOrDefault()?.RecordCount ?? 0;

            return new MonAnSearchResponse
            {
                PageIndex = request.PageIndex,
                PageSize = request.PageSize,
                TotalItems = totalCount,
                Items = items
            };
        }

        public async Task<IEnumerable<MonAn>> GetAllAsync()
        {
            const string sql = "SELECT * FROM MonAn ORDER BY NgayTao DESC";
            using var conn = _context.CreateConnection();
            return await conn.QueryAsync<MonAn>(sql);
        }

        public async Task<MonAn?> GetByIdAsync(string maMonAn)
        {
            const string sql = "SELECT * FROM MonAn WHERE MaMonAn = @MaMonAn";
            using var conn = _context.CreateConnection();
            return await conn.QueryFirstOrDefaultAsync<MonAn>(sql, new { MaMonAn = maMonAn });
        }

        public async Task<IEnumerable<MonAn>> GetByCuaHangAsync(string maCuaHang)
        {
            const string sql = "SELECT * FROM MonAn WHERE MaCuaHang = @MaCuaHang ORDER BY NgayTao DESC";
            using var conn = _context.CreateConnection();
            return await conn.QueryAsync<MonAn>(sql, new { MaCuaHang = maCuaHang });
        }

        public async Task<bool> CreateAsync(MonAn monAn)
        {
            const string sql = @"
                INSERT INTO MonAn (MaMonAn, MaCuaHang, MaDanhMuc, TenMonAn, MoTa, Gia, AnhMonAn, DanhGia, TrangThai, NgayTao)
                VALUES (@MaMonAn, @MaCuaHang, @MaDanhMuc, @TenMonAn, @MoTa, @Gia, @AnhMonAn, @DanhGia, @TrangThai, GETDATE())";

            using var conn = _context.CreateConnection();
            var rows = await conn.ExecuteAsync(sql, monAn);
            return rows > 0;
        }

        public async Task<bool> UpdateAsync(MonAn monAn)
        {
            const string sql = @"
                UPDATE MonAn 
                SET MaCuaHang = @MaCuaHang,
                    MaDanhMuc = @MaDanhMuc,
                    TenMonAn = @TenMonAn,
                    MoTa = @MoTa,
                    Gia = @Gia,
                    AnhMonAn = @AnhMonAn,
                    DanhGia = @DanhGia,
                    TrangThai = @TrangThai
                WHERE MaMonAn = @MaMonAn";

            using var conn = _context.CreateConnection();
            var rows = await conn.ExecuteAsync(sql, monAn);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(string maMonAn)
        {
            const string sql = "DELETE FROM MonAn WHERE MaMonAn = @MaMonAn";
            using var conn = _context.CreateConnection();
            var rows = await conn.ExecuteAsync(sql, new { MaMonAn = maMonAn });
            return rows > 0;
        }
    }
}
