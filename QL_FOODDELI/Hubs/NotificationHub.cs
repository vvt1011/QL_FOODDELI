using Microsoft.AspNetCore.SignalR;

namespace QL_FOODDELI.Hubs
{
    public class NotificationHub : Hub
    {
        // Hàm test kết nối SignalR từ Client
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}