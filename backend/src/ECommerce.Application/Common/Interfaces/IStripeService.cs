namespace ECommerce.Application.Common.Interfaces;

public interface IStripeService
{
    Task<string> CreatePaymentIntentAsync(decimal amount, string currency, string orderId, string customerEmail);
    Task<bool> ConfirmPaymentAsync(string paymentIntentId);
    Task<string?> RefundPaymentAsync(string paymentIntentId, decimal? amount = null);
    Task<bool> HandleWebhookAsync(string payload, string signature);
}
