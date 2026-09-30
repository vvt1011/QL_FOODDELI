using Dapper;
using QL_FOODDELI.Data;
using QL_FOODDELI.Models;

namespace QL_FOODDELI.Repositories
{
    public class GioHangRepository : IGioHangRepository
    {
        private readonly DapperContext _context;

        public GioHangRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<GioHang?> GetByNguoiDungAsync(string maNguoiDung)
        {
            using var conn = _context.CreateConnection();
            const string sqlGioHang = "SELECT TOP 1 * FROM GioHang WHERE MaNguoiDung = @MaNguoiDung";
            var gioHang = await conn.QueryFirstOrDefaultAsync<GioHang>(sqlGioHang, new { MaNguoiDung = maNguoiDung });

            if (gioHang == null)
            {
                var maGioHang = "GH" + Guid.NewGuid().ToString("N")[..10];
                const string sqlCreate = @"
                    INSERT INTO GioHang (MaGioHang, MaNguoiDung, NgayTao, NgayCapNhat)
                    VALUES (@MaGioHang, @MaNguoiDung, GETDATE(), GETDATE())";
                await conn.ExecuteAsync(sqlCreate, new { MaGioHang = maGioHang, MaNguoiDung = maNguoiDung });

                gioHang = new GioHang
                {
                    MaGioHang = maGioHang,
                    MaNguoiDung = maNguoiDung,
                    NgayTao = DateTime.Now,
                    NgayCapNhat = DateTime.Now,
                    Items = new List<ChiTietGioHang>()
                };
                return gioHang;
            }

            const string sqlItems = @"
                SELECT ct.*, m.TenMonAn, m.AnhMonAn
                FROM ChiTietGioHang ct
                LEFT JOIN MonAn m ON ct.MaMonAn = m.MaMonAn
                WHERE ct.MaGioHang = @MaGioHang";

            var items = await conn.QueryAsync<ChiTietGioHang>(sqlItems, new { MaGioHang = gioHang.MaGioHang });
            gioHang.Items = items.ToList();

            return gioHang;
        }

        public async Task<bool> AddItemAsync(string maNguoiDung, string maMonAn, int soLuong)
        {
            var gioHang = await GetByNguoiDungAsync(maNguoiDung);
            if (gioHang == null) return false;

            using var conn = _context.CreateConnection();
            const string sqlCheckMon = "SELECT Gia FROM MonAn WHERE MaMonAn = @MaMonAn";
            var gia = await conn.ExecuteScalarAsync<double?>(sqlCheckMon, new { MaMonAn = maMonAn });
            if (gia == null) return false;

            const string sqlCheckItem = @"
                SELECT MaChiTietGioHang, SoLuong 
                FROM ChiTietGioHang 
                WHERE MaGioHang = @MaGioHang AND MaMonAn = @MaMonAn";

            var existing = await conn.QueryFirstOrDefaultAsync<ChiTietGioHang>(
                sqlCheckItem,
                new { MaGioHang = gioHang.MaGioHang, MaMonAn = maMonAn }
            );

            if (existing != null)
            {
                const string sqlUpdate = @"
                    UPDATE ChiTietGioHang 
                    SET SoLuong = SoLuong + @SoLuong, Gia = @Gia 
                    WHERE MaChiTietGioHang = @MaChiTietGioHang";
                await conn.ExecuteAsync(sqlUpdate, new
                {
                    SoLuong = soLuong,
                    Gia = gia,
                    MaChiTietGioHang = existing.MaChiTietGioHang
                });
            }
            else
            {
                var maChiTiet = "CTGH" + Guid.NewGuid().ToString("N")[..10];
                const string sqlInsert = @"
                    INSERT INTO ChiTietGioHang (MaChiTietGioHang, MaGioHang, MaMonAn, SoLuong, Gia)
                    VALUES (@MaChiTietGioHang, @MaGioHang, @MaMonAn, @SoLuong, @Gia)";
                await conn.ExecuteAsync(sqlInsert, new
                {
                    MaChiTietGioHang = maChiTiet,
                    MaGioHang = gioHang.MaGioHang,
                    MaMonAn = maMonAn,
                    SoLuong = soLuong,
                    Gia = gia
                });
            }

            return true;
        }

        public async Task<bool> UpdateItemQuantityAsync(
     string maNguoiDung,
     string maChiTietGioHang,
     int soLuong)
        {
            if (soLuong <= 0)
            {
                return await RemoveItemAsync(maNguoiDung, maChiTietGioHang);
            }

            using var conn = _context.CreateConnection();

            const string sql = @"
        UPDATE ct
        SET ct.SoLuong = @SoLuong
        FROM ChiTietGioHang ct
        INNER JOIN GioHang gh ON ct.MaGioHang = gh.MaGioHang
        WHERE ct.MaChiTietGioHang = @MaChiTietGioHang
          AND gh.MaNguoiDung = @MaNguoiDung";

            var rows = await conn.ExecuteAsync(sql, new
            {
                SoLuong = soLuong,
                MaChiTietGioHang = maChiTietGioHang,
                MaNguoiDung = maNguoiDung
            });

            return rows > 0;
        }

        public async Task<bool> RemoveItemAsync(
      string maNguoiDung,
      string maChiTietGioHang)
        {
            using var conn = _context.CreateConnection();

            const string sql = @"
        DELETE ct
        FROM ChiTietGioHang ct
        INNER JOIN GioHang gh ON ct.MaGioHang = gh.MaGioHang
        WHERE ct.MaChiTietGioHang = @MaChiTietGioHang
          AND gh.MaNguoiDung = @MaNguoiDung";

            var rows = await conn.ExecuteAsync(sql, new
            {
                MaChiTietGioHang = maChiTietGioHang,
                MaNguoiDung = maNguoiDung
            });

            return rows > 0;
        }

        public async Task<bool> ClearGioHangAsync(string maNguoiDung)
        {
            var gioHang = await GetByNguoiDungAsync(maNguoiDung);
            if (gioHang == null) return false;

            using var conn = _context.CreateConnection();
            const string sql = "DELETE FROM ChiTietGioHang WHERE MaGioHang = @MaGioHang";
            await conn.ExecuteAsync(sql, new { MaGioHang = gioHang.MaGioHang });
            return true;
        }
    }
}
