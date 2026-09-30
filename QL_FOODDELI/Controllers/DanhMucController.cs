using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QL_FOODDELI.Models;
using QL_FOODDELI.Repositories;

namespace QL_FOODDELI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DanhMucController : ControllerBase
    {
        private readonly IDanhMucRepository _danhMucRepo;

        public DanhMucController(IDanhMucRepository danhMucRepo)
        {
            _danhMucRepo = danhMucRepo;
        }

        // =========================
        // GET: api/DanhMuc
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetDanhMucs()
        {
            var danhMucs = await _danhMucRepo.GetAllAsync();
            return Ok(danhMucs);
        }

        // =========================
        // GET: api/DanhMuc/{id}
        // =========================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDanhMuc(string id)
        {
            var danhMuc = await _danhMucRepo.GetByIdAsync(id);
            if (danhMuc == null)
            {
                return NotFound(new { message = "Khong tim thay danh muc" });
            }
            return Ok(danhMuc);
        }

        // =========================
        // POST: api/DanhMuc
        // =========================
        [HttpPost]
        [Authorize(Roles = "QuanLy,Admin")]
        public async Task<IActionResult> CreateDanhMuc([FromBody] DanhMuc danhMuc)
        {
            if (danhMuc == null)
                return BadRequest(new { message = "Du lieu khong hop le" });

            if (string.IsNullOrEmpty(danhMuc.MaDanhMuc))
                danhMuc.MaDanhMuc = "DM" + Guid.NewGuid().ToString("N")[..10];

            var success = await _danhMucRepo.CreateAsync(danhMuc);
            if (!success)
                return BadRequest(new { message = "Khong the tao danh muc" });

            return Ok(new { message = "Tao danh muc thanh cong", maDanhMuc = danhMuc.MaDanhMuc });
        }

        // =========================
        // PUT: api/DanhMuc/{id}
        // =========================
        [HttpPut("{id}")]
        [Authorize(Roles = "QuanLy,Admin")]
        public async Task<IActionResult> UpdateDanhMuc(string id, [FromBody] DanhMuc danhMuc)
        {
            if (danhMuc == null)
                return BadRequest(new { message = "Du lieu khong hop le" });

            danhMuc.MaDanhMuc = id;
            var success = await _danhMucRepo.UpdateAsync(danhMuc);
            if (!success)
                return NotFound(new { message = "Khong tim thay hoac cap nhat that bai" });

            return Ok(new { message = "Cap nhat danh muc thanh cong" });
        }

        // =========================
        // DELETE: api/DanhMuc/{id}
        // =========================
        [HttpDelete("{id}")]
        [Authorize(Roles = "QuanLy,Admin")]
        public async Task<IActionResult> DeleteDanhMuc(string id)
        {
            var success = await _danhMucRepo.DeleteAsync(id);
            if (!success)
                return NotFound(new { message = "Khong tim thay danh muc de xoa" });

            return Ok(new { message = "Xoa danh muc thanh cong" });
        }
    }
}