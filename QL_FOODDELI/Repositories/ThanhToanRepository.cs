using Dapper;
using QL_FOODDELI.Data;
using QL_FOODDELI.Models;

namespace QL_FOODDELI.Repositories
{
    public class ThanhToanRepository : IThanhToanRepository
    {
        private readonly DapperContext _context;

        public ThanhToanRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateAsync(ThanhToan thanhToan)
        {
            const string sql = @"
                INSERT INTO ThanhToan
                (
                    MaThanhToan,
                    MaDonHang,
                    PhuongThuc,
                    SoTien,
                    TrangThai,
                    MaGiaoDich,
                    NgayThanhToan
                )
                VALUES
                (
                    @MaThanhToan,
                    @MaDonHang,
                    @PhuongThuc,
                    @SoTien,
                    @TrangThai,
                    @MaGiaoDich,
                    @NgayThanhToan
                )";

            using var conn = _context.CreateConnection();

            var rows = await conn.ExecuteAsync(
                sql,
                thanhToan);

            return rows > 0;
        }

        public async Task<ThanhToan?> GetByDonHangAsync(
            string maDonHang)
        {
            const string sql = @"
                SELECT TOP 1 *
                FROM ThanhToan
                WHERE MaDonHang = @MaDonHang
                ORDER BY NgayThanhToan DESC";

            using var conn = _context.CreateConnection();

            return await conn.QueryFirstOrDefaultAsync<ThanhToan>(
                sql,
                new
                {
                    MaDonHang = maDonHang
                });
        }

        public async Task<bool> UpdateTrangThaiAsync(
            string maDonHang,
            string trangThai,
            string? maGiaoDich = null,
            DateTime? ngayThanhToan = null)
        {
            const string sql = @"
                UPDATE ThanhToan
                SET
                    TrangThai = @TrangThai,
                    MaGiaoDich = @MaGiaoDich,
                    NgayThanhToan = @NgayThanhToan
                WHERE MaDonHang = @MaDonHang";

            using var conn = _context.CreateConnection();

            var rows = await conn.ExecuteAsync(
                sql,
                new
                {
                    MaDonHang = maDonHang,
                    TrangThai = trangThai,
                    MaGiaoDich = maGiaoDich,
                    NgayThanhToan = ngayThanhToan
                });

            return rows > 0;
        }
    }
}
