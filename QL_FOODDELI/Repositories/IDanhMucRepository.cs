using QL_FOODDELI.Models;

namespace QL_FOODDELI.Repositories
{
    public interface IDanhMucRepository
    {
        Task<IEnumerable<DanhMuc>> GetAllAsync();
        Task<DanhMuc?> GetByIdAsync(string maDanhMuc);
        Task<bool> CreateAsync(DanhMuc danhMuc);
        Task<bool> UpdateAsync(DanhMuc danhMuc);
        Task<bool> DeleteAsync(string maDanhMuc);
    }
}
