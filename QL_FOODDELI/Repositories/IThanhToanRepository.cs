using QL_FOODDELI.Models;

namespace QL_FOODDELI.Repositories
{
    public interface IThanhToanRepository
    {
        Task<bool> CreateAsync(ThanhToan thanhToan);

        Task<ThanhToan?> GetByDonHangAsync(string maDonHang);

        Task<bool> UpdateTrangThaiAsync(
            string maDonHang,
            string trangThai,
            string? maGiaoDich = null,
            DateTime? ngayThanhToan = null);
    }

}
