namespace ECommerce.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string htmlBody);
    Task SendWelcomeEmailAsync(string to, string name);
    Task SendEmailVerificationAsync(string to, string name, string token);
    Task SendPasswordResetAsync(string to, string name, string token);
    Task SendOrderConfirmationAsync(string to, string name, string orderNumber, decimal total);
    Task SendOrderStatusUpdateAsync(string to, string name, string orderNumber, string status);
    Task SendShippingNotificationAsync(string to, string name, string orderNumber, string trackingNumber);
}
