using Dapper;
using QL_FOODDELI.Data;
using QL_FOODDELI.DTOs;
using QL_FOODDELI.Models;
using System.Data;
using System.Text.Json;

namespace QL_FOODDELI.Repositories
{
    public class DonHangRepository : IDonHangRepository
    {
        private readonly DapperContext _context;

        public DonHangRepository(DapperContext context)
        {
            _context = context;
        }

        // =====================================================
        // TẠO ĐƠN HÀNG
        // =====================================================
        public async Task<string> CreateAsync(
            string maNguoiDung,
            DonHangCreateRequest request)
        {
            var maDonHang = string.IsNullOrEmpty(request.MaDonHang)
                ? "DH" + DateTime.Now.ToString("yyyyMMddHHmmssfff")
                : request.MaDonHang;

            var chiTietsPrepared = request.ChiTiets.Select(ct => new
            {
                MaChiTietDonHang = string.IsNullOrEmpty(ct.MaChiTietDonHang)
                    ? "CTDH" + Guid.NewGuid().ToString("N")[..10]
                    : ct.MaChiTietDonHang,

                MaMonAn = ct.MaMonAn,
                SoLuong = ct.SoLuong,
                DonGia = ct.DonGia,
                ThanhTien = ct.ThanhTien > 0
                    ? ct.ThanhTien
                    : ct.SoLuong * ct.DonGia
            }).ToList();

            var jsonChiTiet =
                JsonSerializer.Serialize(chiTietsPrepared);

            using var conn = _context.CreateConnection();

            var parameters = new DynamicParameters();

            parameters.Add("@MaDonHang", maDonHang);
            parameters.Add("@MaNguoiDung", maNguoiDung);
            parameters.Add("@MaDiaChi", request.MaDiaChi);
            parameters.Add("@TongTien", request.TongTien);
            parameters.Add("@PhiGiaoHang", request.PhiGiaoHang);
            parameters.Add("@GiamGia", request.GiamGia);
            parameters.Add("@ThanhTien", request.ThanhTien);
            parameters.Add("@GhiChu", request.GhiChu ?? string.Empty);
            parameters.Add("@listjson_chitiet", jsonChiTiet);

            await conn.ExecuteAsync(
                "sp_don_hang_create",
                parameters,
                commandType: CommandType.StoredProcedure);

            // =====================================================
            // Ghi lịch sử trạng thái ban đầu
            // 1 = Chờ xác nhận
            // =====================================================

            var maLichSu =
                "LS" + Guid.NewGuid().ToString("N")[..10];

            const string sqlLog = @"
                INSERT INTO LichSuTrangThaiDonHang
                (
                    MaLichSu,
                    MaDonHang,
                    TrangThaiCu,
                    TrangThaiMoi,
                    MaNguoiThayDoi,
                    ThoiGian,
                    GhiChu
                )
                VALUES
                (
                    @MaLichSu,
                    @MaDonHang,
                    NULL,
                    @TrangThaiMoi,
                    @MaNguoiThayDoi,
                    GETDATE(),
                    @GhiChu
                )";

            await conn.ExecuteAsync(
                sqlLog,
                new
                {
                    MaLichSu = maLichSu,
                    MaDonHang = maDonHang,
                    TrangThaiMoi = 1,
                    MaNguoiThayDoi = maNguoiDung,
                    GhiChu = "Khách hàng tạo đơn mới"
                });

            return maDonHang;
        }

        // =====================================================
        // LẤY ĐƠN HÀNG THEO ID
        // =====================================================
        public async Task<DonHang?> GetByIdAsync(
            string maDonHang)
        {
            using var conn =
                _context.CreateConnection();

            var parameters =
                new DynamicParameters();

            parameters.Add(
                "@MaDonHang",
                maDonHang);

            var donHang =
                await conn.QueryFirstOrDefaultAsync<DonHang>(
                    "sp_don_hang_get_by_id",
                    parameters,
                    commandType: CommandType.StoredProcedure);

            if (donHang != null &&
                !string.IsNullOrEmpty(donHang.listjson_chitiet))
            {
                try
                {
                    donHang.ChiTietDonHangs =
                        JsonSerializer.Deserialize<List<ChiTietDonHang>>(
                            donHang.listjson_chitiet,
                            new JsonSerializerOptions
                            {
                                PropertyNameCaseInsensitive = true
                            });
                }
                catch
                {
                    donHang.ChiTietDonHangs =
                        new List<ChiTietDonHang>();
                }
            }

            return donHang;
        }

        // =====================================================
        // CẬP NHẬT ĐƠN HÀNG
        // =====================================================
        public async Task<bool> UpdateAsync(
            DonHangUpdateRequest request)
        {
            // -------------------------------------------------
            // Kiểm tra request
            // -------------------------------------------------
            if (request == null ||
                string.IsNullOrWhiteSpace(request.MaDonHang))
            {
                return false;
            }

            // -------------------------------------------------
            // Kiểm tra đơn hàng có tồn tại trước khi update
            // -------------------------------------------------
            const string sqlCheck = @"
                SELECT COUNT(1)
                FROM DonHang
                WHERE MaDonHang = @MaDonHang";

            using var conn = _context.CreateConnection();

            var exists =
                await conn.ExecuteScalarAsync<int>(
                    sqlCheck,
                    new
                    {
                        MaDonHang = request.MaDonHang
                    });

            if (exists == 0)
            {
                return false;
            }

            // -------------------------------------------------
            // Chuẩn bị JSON chi tiết
            // -------------------------------------------------
            string? jsonChiTiet = null;

            if (request.listjson_chitiet != null &&
                request.listjson_chitiet.Count > 0)
            {
                jsonChiTiet =
                    JsonSerializer.Serialize(
                        request.listjson_chitiet);
            }

            // -------------------------------------------------
            // Gọi Stored Procedure
            // -------------------------------------------------
            var parameters =
                new DynamicParameters();

            parameters.Add(
                "@MaDonHang",
                request.MaDonHang);

            parameters.Add(
                "@TrangThai",
                request.TrangThai);

            parameters.Add(
                "@GhiChu",
                request.GhiChu ?? string.Empty);

            parameters.Add(
                "@listjson_chitiet",
                jsonChiTiet);

            await conn.ExecuteAsync(
                "sp_don_hang_update",
                parameters,
                commandType: CommandType.StoredProcedure);

            // Stored Procedure đã thực thi thành công
            // và đơn hàng đã được xác nhận tồn tại.
            return true;
        }

        // =====================================================
        // CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
        // + GHI LỊCH SỬ
        // =====================================================
        public async Task<bool> UpdateTrangThaiAsync(
            string maDonHang,
            string trangThaiMoi,
            string? maNguoiThayDoi = null,
            string? ghiChu = null)
        {
            if (string.IsNullOrWhiteSpace(maDonHang) ||
                string.IsNullOrWhiteSpace(trangThaiMoi))
            {
                return false;
            }

            using var conn =
                _context.CreateConnection();

            // =====================================================
            // 1. Kiểm tra đơn hàng và lấy trạng thái cũ
            // =====================================================

            const string sqlGetOld = @"
                SELECT TrangThai
                FROM DonHang
                WHERE MaDonHang = @MaDonHang";

            var trangThaiCu =
                await conn.ExecuteScalarAsync<string?>(
                    sqlGetOld,
                    new
                    {
                        MaDonHang = maDonHang
                    });

            if (trangThaiCu == null)
            {
                return false;
            }

            // =====================================================
            // 2. Cập nhật trạng thái
            // =====================================================

            var parameters =
                new DynamicParameters();

            parameters.Add(
                "@MaDonHang",
                maDonHang);

            parameters.Add(
                "@TrangThai",
                trangThaiMoi);

            await conn.ExecuteAsync(
                "sp_don_hang_update_trang_thai",
                parameters,
                commandType: CommandType.StoredProcedure);

            // =====================================================
            // 3. Ghi lịch sử trạng thái
            // =====================================================

            int? trangThaiCuInt =
                int.TryParse(
                    trangThaiCu,
                    out var oldStatus)
                    ? oldStatus
                    : null;

            int? trangThaiMoiInt =
                int.TryParse(
                    trangThaiMoi,
                    out var newStatus)
                    ? newStatus
                    : null;

            // Chỉ ghi lịch sử nếu trạng thái mới là số
            if (trangThaiMoiInt.HasValue)
            {
                var maLichSu =
                    "LS" +
                    Guid.NewGuid()
                        .ToString("N")[..10];

                const string sqlLog = @"
                    INSERT INTO LichSuTrangThaiDonHang
                    (
                        MaLichSu,
                        MaDonHang,
                        TrangThaiCu,
                        TrangThaiMoi,
                        MaNguoiThayDoi,
                        ThoiGian,
                        GhiChu
                    )
                    VALUES
                    (
                        @MaLichSu,
                        @MaDonHang,
                        @TrangThaiCu,
                        @TrangThaiMoi,
                        @MaNguoiThayDoi,
                        GETDATE(),
                        @GhiChu
                    )";

                await conn.ExecuteAsync(
                    sqlLog,
                    new
                    {
                        MaLichSu = maLichSu,
                        MaDonHang = maDonHang,
                        TrangThaiCu = trangThaiCuInt,
                        TrangThaiMoi = trangThaiMoiInt,
                        MaNguoiThayDoi = maNguoiThayDoi,
                        GhiChu =
                            ghiChu ??
                            $"Chuyển trạng thái sang: {trangThaiMoi}"
                    });
            }

            return true;
        }

        // =====================================================
        // LẤY LỊCH SỬ TRẠNG THÁI
        // =====================================================
        public async Task<IEnumerable<LichSuTrangThaiDonHang>>
            GetLichSuTrangThaiAsync(
                string maDonHang)
        {
            const string sql = @"
                SELECT *
                FROM LichSuTrangThaiDonHang
                WHERE MaDonHang = @MaDonHang
                ORDER BY ThoiGian ASC";

            using var conn =
                _context.CreateConnection();

            return await conn.QueryAsync<LichSuTrangThaiDonHang>(
                sql,
                new
                {
                    MaDonHang = maDonHang
                });
        }

        // =====================================================
        // LẤY DANH SÁCH CỬA HÀNG TRONG ĐƠN
        // =====================================================
        public async Task<List<string>>
            GetDanhSachMaCuaHangAsync(
                string maDonHang)
        {
            const string sql = @"
                SELECT DISTINCT m.MaCuaHang
                FROM ChiTietDonHang ct
                JOIN MonAn m
                    ON ct.MaMonAn = m.MaMonAn
                WHERE ct.MaDonHang = @MaDonHang
                  AND m.MaCuaHang IS NOT NULL";

            using var conn =
                _context.CreateConnection();

            var result =
                await conn.QueryAsync<string>(
                    sql,
                    new
                    {
                        MaDonHang = maDonHang
                    });

            return result.ToList();
        }

        // =====================================================
        // KIỂM TRA CHỦ SHOP CÓ QUYỀN
        // CẬP NHẬT / XEM ĐƠN HÀNG
        // =====================================================
        public async Task<bool>
            ChuShopCoQuyenCapNhatDonHangAsync(
                string maNguoiDung,
                string maDonHang)
        {
            const string sql = @"
                SELECT COUNT(1)
                FROM ChiTietDonHang ct
                INNER JOIN MonAn m
                    ON ct.MaMonAn = m.MaMonAn
                INNER JOIN CuaHang ch
                    ON m.MaCuaHang = ch.MaCuaHang
                WHERE ct.MaDonHang = @MaDonHang
                  AND ch.MaChuShop = @MaNguoiDung";

            using var conn =
                _context.CreateConnection();

            var count =
                await conn.ExecuteScalarAsync<int>(
                    sql,
                    new
                    {
                        MaNguoiDung = maNguoiDung,
                        MaDonHang = maDonHang
                    });

            return count > 0;
        }

        // =====================================================
        // XÓA ĐƠN HÀNG
        // =====================================================
        public async Task<bool> DeleteAsync(
            string maDonHang)
        {
            if (string.IsNullOrWhiteSpace(maDonHang))
            {
                return false;
            }

            using var conn =
                _context.CreateConnection();

            // -------------------------------------------------
            // Kiểm tra đơn hàng tồn tại
            // -------------------------------------------------
            const string sqlCheck = @"
                SELECT COUNT(1)
                FROM DonHang
                WHERE MaDonHang = @MaDonHang";

            var exists =
                await conn.ExecuteScalarAsync<int>(
                    sqlCheck,
                    new
                    {
                        MaDonHang = maDonHang
                    });

            if (exists == 0)
            {
                return false;
            }

            var parameters =
                new DynamicParameters();

            parameters.Add(
                "@MaDonHang",
                maDonHang);

            // -------------------------------------------------
            // Xóa lịch sử trước
            // -------------------------------------------------
            await conn.ExecuteAsync(
                @"DELETE FROM LichSuTrangThaiDonHang
                  WHERE MaDonHang = @MaDonHang",
                new
                {
                    MaDonHang = maDonHang
                });

            // -------------------------------------------------
            // Xóa đơn hàng
            // -------------------------------------------------
            await conn.ExecuteAsync(
                "sp_don_hang_delete",
                parameters,
                commandType: CommandType.StoredProcedure);

            return true;
        }

        // =====================================================
        // LẤY ĐƠN HÀNG CỦA NGƯỜI DÙNG
        // =====================================================
        public async Task<IEnumerable<DonHang>>
            GetByNguoiDungAsync(
                string maNguoiDung)
        {
            const string sql = @"
                SELECT *
                FROM DonHang
                WHERE MaNguoiDung = @MaNguoiDung
                ORDER BY NgayDat DESC";

            using var conn =
                _context.CreateConnection();

            return await conn.QueryAsync<DonHang>(
                sql,
                new
                {
                    MaNguoiDung = maNguoiDung
                });
        }

        // =====================================================
        // LẤY TẤT CẢ ĐƠN HÀNG
        // =====================================================
        public async Task<IEnumerable<DonHang>>
            GetAllAsync()
        {
            const string sql = @"
                SELECT *
                FROM DonHang
                ORDER BY NgayDat DESC";

            using var conn =
                _context.CreateConnection();

            return await conn.QueryAsync<DonHang>(sql);
        }
    }
}