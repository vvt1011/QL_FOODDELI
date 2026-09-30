using Dapper;
using QL_FOODDELI.Data;
using QL_FOODDELI.Models;
using System.Data;

namespace QL_FOODDELI.Repositories
{
    public class NguoiDungRepository : INguoiDungRepository
    {
        private readonly DapperContext _context;

        public NguoiDungRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<NguoiDung?> GetByIdAsync(string maNguoiDung)
        {
            const string sql = @"
                SELECT u.*, v.TenVaiTro 
                FROM NguoiDung u
                LEFT JOIN NguoiDung_VaiTro uv ON u.MaNguoiDung = uv.MaNguoiDung
                LEFT JOIN VaiTro v ON uv.MaVaiTro = v.MaVaiTro
                WHERE u.MaNguoiDung = @MaNguoiDung";

            using var conn = _context.CreateConnection();
            return await conn.QueryFirstOrDefaultAsync<NguoiDung>(sql, new { MaNguoiDung = maNguoiDung });
        }

        public async Task<NguoiDung?> GetByEmailAsync(string email)
        {
            const string sql = @"
                SELECT TOP 1 u.*, v.TenVaiTro 
                FROM NguoiDung u
                LEFT JOIN NguoiDung_VaiTro uv ON u.MaNguoiDung = uv.MaNguoiDung
                LEFT JOIN VaiTro v ON uv.MaVaiTro = v.MaVaiTro
                WHERE u.Email = @Email";

            using var conn = _context.CreateConnection();
            return await conn.QueryFirstOrDefaultAsync<NguoiDung>(sql, new { Email = email });
        }

        public async Task<bool> ExistsEmailAsync(string email)
        {
            const string sql = "SELECT COUNT(1) FROM NguoiDung WHERE Email = @Email";
            using var conn = _context.CreateConnection();
            var count = await conn.ExecuteScalarAsync<int>(sql, new { Email = email });
            return count > 0;
        }

        public async Task<bool> CreateAsync(NguoiDung nguoiDung, string? maVaiTro = null)
        {
            using var conn = _context.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@MaNguoiDung", nguoiDung.MaNguoiDung);
            parameters.Add("@HoTen", nguoiDung.HoTen);
            parameters.Add("@Email", nguoiDung.Email);
            parameters.Add("@MatKhau", nguoiDung.MatKhau);
            parameters.Add("@SoDienThoai", nguoiDung.SoDienThoai);
            parameters.Add("@AnhDaiDien", nguoiDung.AnhDaiDien);
            parameters.Add("@TrangThai", nguoiDung.TrangThai ?? 1);

            await conn.ExecuteAsync("sp_nguoi_dung_create", parameters, commandType: CommandType.StoredProcedure);

            if (!string.IsNullOrEmpty(maVaiTro))
            {
                const string sqlRole = @"
                    IF NOT EXISTS (SELECT 1 FROM VaiTro WHERE MaVaiTro = @MaVaiTro)
                    BEGIN
                        INSERT INTO VaiTro (MaVaiTro, TenVaiTro) VALUES (@MaVaiTro, @MaVaiTro)
                    END;
                    INSERT INTO NguoiDung_VaiTro (MaNguoiDung, MaVaiTro) 
                    VALUES (@MaNguoiDung, @MaVaiTro)";
                await conn.ExecuteAsync(sqlRole, new { MaNguoiDung = nguoiDung.MaNguoiDung, MaVaiTro = maVaiTro });
            }

            return true;
        }

        public async Task<IEnumerable<string>> GetRolesByUserIdAsync(string maNguoiDung)
        {
            const string sql = @"
                SELECT uv.MaVaiTro 
                FROM NguoiDung_VaiTro uv
                WHERE uv.MaNguoiDung = @MaNguoiDung
                UNION
                SELECT v.TenVaiTro 
                FROM VaiTro v
                INNER JOIN NguoiDung_VaiTro uv ON v.MaVaiTro = uv.MaVaiTro
                WHERE uv.MaNguoiDung = @MaNguoiDung";

            using var conn = _context.CreateConnection();
            var roles = await conn.QueryAsync<string>(sql, new { MaNguoiDung = maNguoiDung });
            return roles.Where(r => !string.IsNullOrWhiteSpace(r));
        }

        public async Task<IEnumerable<NguoiDung>> GetAllAsync()
        {
            const string sql = "SELECT * FROM NguoiDung ORDER BY NgayTao DESC";
            using var conn = _context.CreateConnection();
            return await conn.QueryAsync<NguoiDung>(sql);
        }
    }
}
