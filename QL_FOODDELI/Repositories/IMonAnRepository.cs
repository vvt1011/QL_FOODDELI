using QL_FOODDELI.DTOs;
using QL_FOODDELI.Models;

namespace QL_FOODDELI.Repositories
{
    public interface IMonAnRepository
    {
        Task<MonAnSearchResponse> SearchAsync(MonAnSearchRequest request);
        Task<IEnumerable<MonAn>> GetAllAsync();
        Task<MonAn?> GetByIdAsync(string maMonAn);
        Task<IEnumerable<MonAn>> GetByCuaHangAsync(string maCuaHang);
        Task<bool> CreateAsync(MonAn monAn);
        Task<bool> UpdateAsync(MonAn monAn);
        Task<bool> DeleteAsync(string maMonAn);
    }
}
