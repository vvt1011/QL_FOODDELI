using QL_FOODDELI.DTOs;

namespace QL_FOODDELI.Repositories
{
    public interface IVoucherRepository
    {
        Task<IEnumerable<VoucherCreateRequest>> GetActiveVouchersAsync();
        Task<KiemTraVoucherResponse> KiemTraVoucherAsync(KiemTraVoucherRequest request);
        Task<bool> CreateAsync(VoucherCreateRequest request);
    }
}
