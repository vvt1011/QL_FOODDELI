using QL_FOODDELI.DTOs;
using QL_FOODDELI.Models;

namespace QL_FOODDELI.Repositories
{
    public interface IDonHangRepository
    {
        Task<string> CreateAsync(string maNguoiDung, DonHangCreateRequest request);
        Task<DonHang?> GetByIdAsync(string maDonHang);
        Task<bool> UpdateAsync(DonHangUpdateRequest request);
        Task<bool> DeleteAsync(string maDonHang);
        Task<IEnumerable<DonHang>> GetByNguoiDungAsync(string maNguoiDung);
        Task<IEnumerable<DonHang>> GetAllAsync();
        Task<bool> UpdateTrangThaiAsync(string maDonHang, string trangThaiMoi, string? maNguoiThayDoi = null, string? ghiChu = null);
        Task<IEnumerable<LichSuTrangThaiDonHang>> GetLichSuTrangThaiAsync(string maDonHang);
        Task<List<string>> GetDanhSachMaCuaHangAsync(string maDonHang);
        Task<bool> ChuShopCoQuyenCapNhatDonHangAsync( string maNguoiDung,string maDonHang);
    }
}
