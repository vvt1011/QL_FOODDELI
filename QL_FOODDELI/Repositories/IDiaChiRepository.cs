using QL_FOODDELI.DTOs;
using QL_FOODDELI.Models;

namespace QL_FOODDELI.Repositories
{
    public interface IDiaChiRepository
    {
        Task<IEnumerable<DiaChi>> GetByNguoiDungAsync(string maNguoiDung);
        Task<DiaChi?> GetByIdAsync(string maDiaChi);
        Task<string> CreateAsync(string maNguoiDung, DiaChiCreateRequest request);
        Task<bool> UpdateAsync(string maNguoiDung, DiaChiUpdateRequest request);
        Task<bool> SetMacDinhAsync(string maNguoiDung, string maDiaChi);
        Task<bool> DeleteAsync(string maNguoiDung, string maDiaChi);
    }
}