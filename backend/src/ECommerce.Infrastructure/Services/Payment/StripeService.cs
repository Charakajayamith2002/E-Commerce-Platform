using ECommerce.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace ECommerce.Infrastructure.Services.Payment;

public class StripeService : IStripeService
{
    private readonly IConfiguration _configuration;

    public StripeService(IConfiguration configuration)
    {
        _configuration = configuration;
        StripeConfiguration.ApiKey = configuration["Stripe:SecretKey"];
    }

    public async Task<string> CreatePaymentIntentAsync(decimal amount, string currency, string orderId, string customerEmail)
    {
        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(amount * 100),
            Currency = currency,
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions { Enabled = true },
            Metadata = new Dictionary<string, string>
            {
                { "orderId", orderId },
                { "customerEmail", customerEmail }
            },
            ReceiptEmail = customerEmail
        };

        var service = new PaymentIntentService();
        var intent = await service.CreateAsync(options);
        return intent.ClientSecret;
    }

    public async Task<bool> ConfirmPaymentAsync(string paymentIntentId)
    {
        var service = new PaymentIntentService();
        var intent = await service.GetAsync(paymentIntentId);
        return intent.Status == "succeeded";
    }

    public async Task<string?> RefundPaymentAsync(string paymentIntentId, decimal? amount = null)
    {
        var service = new PaymentIntentService();
        var intent = await service.GetAsync(paymentIntentId);

        var refundOptions = new RefundCreateOptions
        {
            PaymentIntent = paymentIntentId,
        };

        if (amount.HasValue)
            refundOptions.Amount = (long)(amount.Value * 100);

        var refundService = new RefundService();
        var refund = await refundService.CreateAsync(refundOptions);
        return refund.Id;
    }

    public async Task<bool> HandleWebhookAsync(string payload, string signature)
    {
        var webhookSecret = _configuration["Stripe:WebhookSecret"]!;

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(payload, signature, webhookSecret);
            // Webhook event handling is done in the controller
            return true;
        }
        catch
        {
            return false;
        }
    }
}
