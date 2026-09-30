using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace QL_FOODDELI.Hubs
{
    public class DonHangHub : Hub
    {
        private readonly ILogger<DonHangHub> _logger;

        public DonHangHub(ILogger<DonHangHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? Context.User?.FindFirst("MaNguoiDung")?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
                _logger.LogInformation("Client {ConnectionId} (User: {UserId}) joined group user_{UserId}", Context.ConnectionId, userId, userId);
            }

            var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
            if (role == "Admin" || role == "QuanLy")
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "admin_channel");
            }
            else if (role == "ChuShop")
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "shop_channel");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("Client {ConnectionId} disconnected", Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        // Cửa hàng join nhận đơn mới theo mã cửa hàng
        public async Task JoinShopGroup(string maCuaHang)
        {
            if (!string.IsNullOrWhiteSpace(maCuaHang))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"shop_{maCuaHang}");
                _logger.LogInformation("Client {ConnectionId} joined group shop_{MaCuaHang}", Context.ConnectionId, maCuaHang);
                await Clients.Caller.SendAsync("JoinedGroup", $"Đã kết nối vào kênh nhận đơn của quán {maCuaHang}");
            }
        }

        public async Task LeaveShopGroup(string maCuaHang)
        {
            if (!string.IsNullOrWhiteSpace(maCuaHang))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"shop_{maCuaHang}");
            }
        }

        // Khách hàng join theo dõi trạng thái đơn theo mã người dùng
        public async Task JoinUserGroup(string maNguoiDung)
        {
            if (!string.IsNullOrWhiteSpace(maNguoiDung))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{maNguoiDung}");
                _logger.LogInformation("Client {ConnectionId} joined group user_{MaNguoiDung}", Context.ConnectionId, maNguoiDung);
                await Clients.Caller.SendAsync("JoinedGroup", $"Đã kết nối vào kênh thông báo khách hàng {maNguoiDung}");
            }
        }
    }
}
