using QL_FOODDELI.Models;

namespace QL_FOODDELI.DTOs
{
    public class MonAnSearchRequest
    {
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? TenMonAn { get; set; } = string.Empty;
        public string? MaDanhMuc { get; set; } = string.Empty;
    }

    public class MonAnSearchResponse
    {
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public long TotalItems { get; set; }
        public List<MonAn> Items { get; set; } = new List<MonAn>();
    }
}
