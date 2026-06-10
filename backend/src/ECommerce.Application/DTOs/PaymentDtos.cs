using ECommerce.Domain.Enums;

namespace ECommerce.Application.DTOs;

public record CreatePaymentIntentDto(Guid OrderId);

public record PaymentIntentResponseDto(
    string ClientSecret,
    string PaymentIntentId,
    decimal Amount,
    string Currency
);

public record PaymentDto(
    Guid Id,
    Guid OrderId,
    string? TransactionId,
    decimal Amount,
    string Currency,
    PaymentMethod Method,
    PaymentStatus Status,
    string? ReceiptUrl,
    DateTime? PaidAt,
    decimal? RefundedAmount
);

public record StripeWebhookDto(string Payload, string Signature);
