using QL_FOODDELI.Models;

namespace QL_FOODDELI.Repositories
{
    public interface IGioHangRepository
    {
        Task<GioHang?> GetByNguoiDungAsync(string maNguoiDung);
        Task<bool> AddItemAsync(string maNguoiDung, string maMonAn, int soLuong);
        Task<bool> UpdateItemQuantityAsync(string maNguoiDung,string maChiTietGioHang, int soLuong);
        Task<bool> RemoveItemAsync(string maNguoiDung,string maChiTietGioHang);
        Task<bool> ClearGioHangAsync(string maNguoiDung);
    }
}
