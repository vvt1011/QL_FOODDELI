using QL_FOODDELI.DTOs;

namespace QL_FOODDELI.Repositories
{
    public interface IThongKeRepository
    {
        Task<IEnumerable<DoanhThuTheoThoiGianDto>> GetDoanhThuAsync(DateTime? tuNgay, DateTime? denNgay, string loai, string? maCuaHang = null);
        Task<IEnumerable<TopMonAnDto>> GetTopMonAnAsync(int top, DateTime? tuNgay, DateTime? denNgay, string? maCuaHang = null);
        Task<ThongKeTongQuanDto> GetTongQuanAsync(string? maCuaHang = null);
    }
}
