using QL_FOODDELI.Models;

namespace QL_FOODDELI.Repositories
{
    public interface INguoiDungRepository
    {
        Task<NguoiDung?> GetByIdAsync(string maNguoiDung);
        Task<NguoiDung?> GetByEmailAsync(string email);
        Task<bool> ExistsEmailAsync(string email);
        Task<bool> CreateAsync(NguoiDung nguoiDung, string? maVaiTro = null);
        Task<IEnumerable<string>> GetRolesByUserIdAsync(string maNguoiDung);
        Task<IEnumerable<NguoiDung>> GetAllAsync();

    }
}
