using QL_FOODDELI.DTOs;
using QL_FOODDELI.Models;

namespace QL_FOODDELI.Repositories
{
    public interface IDonHangRepository
    {
        // =====================================================
        // TẠO ĐƠN HÀNG
        // =====================================================
        Task<string> CreateAsync(
            string maNguoiDung,
            DonHangCreateRequest request);

        // =====================================================
        // LẤY ĐƠN HÀNG THEO ID
        // =====================================================
        Task<DonHang?> GetByIdAsync(
            string maDonHang);

        // =====================================================
        // CẬP NHẬT ĐƠN HÀNG
        // =====================================================
        Task<bool> UpdateAsync(
            DonHangUpdateRequest request);

        // =====================================================
        // XÓA ĐƠN HÀNG
        // =====================================================
        Task<bool> DeleteAsync(
            string maDonHang);

        // =====================================================
        // LẤY ĐƠN HÀNG CỦA NGƯỜI DÙNG
        // =====================================================
        Task<IEnumerable<DonHang>> GetByNguoiDungAsync(
            string maNguoiDung);

        // =====================================================
        // LẤY TẤT CẢ ĐƠN HÀNG
        // Admin / QuanLy
        // =====================================================
        Task<IEnumerable<DonHang>> GetAllAsync();

        // =====================================================
        // LẤY ĐƠN HÀNG CỦA CHUSHOP
        // Chỉ lấy các đơn có món thuộc cửa hàng của ChuShop
        // =====================================================
        Task<IEnumerable<DonHang>> GetByChuShopAsync(
            string maNguoiDung);

        // =====================================================
        // CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
        // =====================================================
        Task<bool> UpdateTrangThaiAsync(
            string maDonHang,
            string trangThaiMoi,
            string? maNguoiThayDoi = null,
            string? ghiChu = null);

        // =====================================================
        // LẤY LỊCH SỬ TRẠNG THÁI
        // =====================================================
        Task<IEnumerable<LichSuTrangThaiDonHang>>
            GetLichSuTrangThaiAsync(
                string maDonHang);

        // =====================================================
        // LẤY DANH SÁCH CỬA HÀNG TRONG ĐƠN
        // =====================================================
        Task<List<string>> GetDanhSachMaCuaHangAsync(
            string maDonHang);

        // =====================================================
        // KIỂM TRA CHUSHOP CÓ QUYỀN
        // XEM / CẬP NHẬT ĐƠN HÀNG
        // =====================================================
        Task<bool> ChuShopCoQuyenCapNhatDonHangAsync(
            string maNguoiDung,
            string maDonHang);
    }
}