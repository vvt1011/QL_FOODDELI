using Dapper;
using QL_FOODDELI.Data;
using QL_FOODDELI.DTOs;
using System.Data;

namespace QL_FOODDELI.Repositories
{
    public class VoucherRepository : IVoucherRepository
    {
        private readonly DapperContext _context;

        public VoucherRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<VoucherCreateRequest>> GetActiveVouchersAsync()
        {
            using var conn = _context.CreateConnection();
            return await conn.QueryAsync<VoucherCreateRequest>(
                "sp_voucher_get_active",
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<KiemTraVoucherResponse> KiemTraVoucherAsync(KiemTraVoucherRequest request)
        {
            const string sql = "SELECT * FROM Voucher WHERE MaVoucher = @MaVoucher AND TrangThai = 1";
            using var conn = _context.CreateConnection();
            var voucher = await conn.QueryFirstOrDefaultAsync<VoucherCreateRequest>(sql, new { request.MaVoucher });

            if (voucher == null)
                return new KiemTraVoucherResponse { HopLe = false, ThongBao = "Mã giảm giá không tồn tại" };

            if (DateTime.Now < voucher.NgayBatDau || DateTime.Now > voucher.NgayKetThuc)
                return new KiemTraVoucherResponse { HopLe = false, ThongBao = "Mã giảm giá chưa đến đợt hoặc đã hết hạn" };

            if (voucher.SoLuong <= 0)
                return new KiemTraVoucherResponse { HopLe = false, ThongBao = "Mã giảm giá đã hết lượt sử dụng" };

            if (request.TongTienDonHang < voucher.GiaTriDonToiThieu)
                return new KiemTraVoucherResponse { HopLe = false, ThongBao = $"Đơn hàng tối thiểu phải từ {voucher.GiaTriDonToiThieu:N0} VNĐ" };

            // Tính số tiền được giảm
            double soTienGiam = 0;
            if (voucher.LoaiGiamGia == "PhanTram")
            {
                soTienGiam = request.TongTienDonHang * (voucher.GiaTri / 100);
                if (voucher.GiamToiDa > 0 && soTienGiam > voucher.GiamToiDa)
                {
                    soTienGiam = voucher.GiamToiDa;
                }
            }
            else // SoTien
            {
                soTienGiam = voucher.GiaTri;
            }

            return new KiemTraVoucherResponse
            {
                HopLe = true,
                ThongBao = "Áp dụng mã giảm giá thành công",
                SoTienGiam = soTienGiam
            };
        }

        public async Task<bool> CreateAsync(VoucherCreateRequest request)
        {
            using var conn = _context.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@MaVoucher", request.MaVoucher);
            parameters.Add("@TenVoucher", request.TenVoucher);
            parameters.Add("@LoaiGiamGia", request.LoaiGiamGia);
            parameters.Add("@GiaTri", request.GiaTri);
            parameters.Add("@GiamToiDa", request.GiamToiDa);
            parameters.Add("@GiaTriDonToiThieu", request.GiaTriDonToiThieu);
            parameters.Add("@NgayBatDau", request.NgayBatDau);
            parameters.Add("@NgayKetThuc", request.NgayKetThuc);
            parameters.Add("@SoLuong", request.SoLuong);

            await conn.ExecuteAsync("sp_voucher_create", parameters, commandType: CommandType.StoredProcedure);
            return true;
        }
    }
}