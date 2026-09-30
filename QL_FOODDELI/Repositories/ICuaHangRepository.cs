using QL_FOODDELI.Models;

namespace QL_FOODDELI.Repositories
{
    public interface ICuaHangRepository
    {
        Task<IEnumerable<CuaHang>> GetAllAsync();
        Task<CuaHang?> GetByIdAsync(string maCuaHang);
        Task<IEnumerable<CuaHang>> GetByChuShopAsync(string maChuShop);
        Task<bool> CreateAsync(CuaHang cuaHang);
        Task<bool> UpdateAsync(CuaHang cuaHang);
        Task<bool> DeleteAsync(string maCuaHang);
    }
}
