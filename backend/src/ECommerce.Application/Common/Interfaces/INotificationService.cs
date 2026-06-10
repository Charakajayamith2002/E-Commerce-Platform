namespace ECommerce.Application.Common.Interfaces;

public interface INotificationService
{
    Task SendNotificationAsync(Guid userId, string title, string message, string? type = null, string? actionUrl = null);
    Task SendBroadcastAsync(string title, string message, string? type = null);
    Task SendOrderUpdateAsync(Guid userId, string orderNumber, string status);
}
