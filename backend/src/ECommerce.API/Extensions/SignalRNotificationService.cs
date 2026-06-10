using ECommerce.API.Hubs;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Persistence.Context;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Extensions;

public class SignalRNotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hub;
    private readonly ApplicationDbContext _context;

    public SignalRNotificationService(IHubContext<NotificationHub> hub, ApplicationDbContext context)
    {
        _hub = hub;
        _context = context;
    }

    public async Task SendNotificationAsync(Guid userId, string title, string message, string? type = null, string? actionUrl = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            ActionUrl = actionUrl
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        await _hub.Clients.Group(userId.ToString())
            .SendAsync("ReceiveNotification", new
            {
                notification.Id,
                notification.Title,
                notification.Message,
                notification.Type,
                notification.ActionUrl,
                notification.CreatedAt
            });
    }

    public async Task SendBroadcastAsync(string title, string message, string? type = null)
    {
        await _hub.Clients.All.SendAsync("ReceiveBroadcast", new { title, message, type });
    }

    public async Task SendOrderUpdateAsync(Guid userId, string orderNumber, string status)
    {
        await SendNotificationAsync(userId, "Order Update",
            $"Your order #{orderNumber} status changed to {status}", "order");
    }
}
