using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QL_FOODDELI.DTOs;
using QL_FOODDELI.Repositories;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VoucherController : ControllerBase
    {
        private readonly IVoucherRepository _voucherRepo;

        public VoucherController(IVoucherRepository voucherRepo)
        {
            _voucherRepo = voucherRepo;
        }

        // GET: api/Voucher/kha-dung
        [HttpGet("kha-dung")]
        public async Task<IActionResult> GetActiveVouchers()
        {
            var list = await _voucherRepo.GetActiveVouchersAsync();
            return Ok(list);
        }

        // POST: api/Voucher/kiem-tra
        [HttpPost("kiem-tra")]
        public async Task<IActionResult> KiemTraVoucher([FromBody] KiemTraVoucherRequest request)
        {
            var result = await _voucherRepo.KiemTraVoucherAsync(request);
            if (!result.HopLe)
                return BadRequest(result);

            return Ok(result);
        }

        // POST: api/Voucher (Tạo voucher - Admin/QuanLy)
        [HttpPost]
        [Authorize(Roles = "Admin,QuanLy")]
        public async Task<IActionResult> Create([FromBody] VoucherCreateRequest request)
        {
            var success = await _voucherRepo.CreateAsync(request);
            if (!success)
                return BadRequest(new { message = "Tạo mã voucher thất bại" });

            return Ok(new { message = "Tạo mã voucher thành công" });
        }
    }
}