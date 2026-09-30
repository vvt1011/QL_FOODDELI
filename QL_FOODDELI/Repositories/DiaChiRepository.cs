using Dapper;
using QL_FOODDELI.Data;
using QL_FOODDELI.DTOs;
using QL_FOODDELI.Models;
using System.Data;

namespace QL_FOODDELI.Repositories
{
    public class DiaChiRepository : IDiaChiRepository
    {
        private readonly DapperContext _context;

        public DiaChiRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DiaChi>> GetByNguoiDungAsync(string maNguoiDung)
        {
            using var conn = _context.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@MaNguoiDung", maNguoiDung);

            return await conn.QueryAsync<DiaChi>(
                "sp_dia_chi_get_by_user",
                parameters,
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<DiaChi?> GetByIdAsync(string maDiaChi)
        {
            using var conn = _context.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@MaDiaChi", maDiaChi);

            return await conn.QueryFirstOrDefaultAsync<DiaChi>(
                "sp_dia_chi_get_by_id",
                parameters,
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<string> CreateAsync(string maNguoiDung, DiaChiCreateRequest request)
        {
            var maDiaChi = string.IsNullOrEmpty(request.MaDiaChi)
                ? "DC" + Guid.NewGuid().ToString("N")[..10]
                : request.MaDiaChi;

            using var conn = _context.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@MaDiaChi", maDiaChi);
            parameters.Add("@MaNguoiDung", maNguoiDung);
            parameters.Add("@NguoiNhan", request.NguoiNhan);
            parameters.Add("@SoDienThoai", request.SoDienThoai);
            parameters.Add("@DiaChiChiTiet", request.DiaChiChiTiet);
            parameters.Add("@PhuongXa", request.PhuongXa);
            parameters.Add("@QuanHuyen", request.QuanHuyen);
            parameters.Add("@TinhThanh", request.TinhThanh);
            parameters.Add("@MacDinh", request.MacDinh);

            await conn.ExecuteAsync("sp_dia_chi_create", parameters, commandType: CommandType.StoredProcedure);

            return maDiaChi;
        }

        public async Task<bool> UpdateAsync(string maNguoiDung, DiaChiUpdateRequest request)
        {
            using var conn = _context.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@MaDiaChi", request.MaDiaChi);
            parameters.Add("@MaNguoiDung", maNguoiDung);
            parameters.Add("@NguoiNhan", request.NguoiNhan);
            parameters.Add("@SoDienThoai", request.SoDienThoai);
            parameters.Add("@DiaChiChiTiet", request.DiaChiChiTiet);
            parameters.Add("@PhuongXa", request.PhuongXa);
            parameters.Add("@QuanHuyen", request.QuanHuyen);
            parameters.Add("@TinhThanh", request.TinhThanh);
            parameters.Add("@MacDinh", request.MacDinh);

            await conn.ExecuteAsync("sp_dia_chi_update", parameters, commandType: CommandType.StoredProcedure);
            return true;
        }

        public async Task<bool> SetMacDinhAsync(string maNguoiDung, string maDiaChi)
        {
            using var conn = _context.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@MaNguoiDung", maNguoiDung);
            parameters.Add("@MaDiaChi", maDiaChi);

            await conn.ExecuteAsync("sp_dia_chi_set_mac_dinh", parameters, commandType: CommandType.StoredProcedure);
            return true;
        }

        public async Task<bool> DeleteAsync(
     string maNguoiDung,
     string maDiaChi)
        {
            using var conn = _context.CreateConnection();

            const string sql = @"
        DELETE FROM DiaChi
        WHERE MaDiaChi = @MaDiaChi
          AND MaNguoiDung = @MaNguoiDung";

            var rows = await conn.ExecuteAsync(sql, new
            {
                MaDiaChi = maDiaChi,
                MaNguoiDung = maNguoiDung
            });

            return rows > 0;
        }
    }
}