using ECommerce.Domain.Enums;

namespace ECommerce.Application.DTOs;

public record OrderDto(
    Guid Id,
    string OrderNumber,
    OrderStatus Status,
    PaymentMethod PaymentMethod,
    PaymentStatus PaymentStatus,
    decimal SubTotal,
    decimal ShippingAmount,
    decimal TaxAmount,
    decimal DiscountAmount,
    decimal TotalAmount,
    string? CouponCode,
    string? TrackingNumber,
    string? Notes,
    AddressSnapshotDto ShippingAddress,
    List<OrderItemDto> Items,
    DateTime CreatedAt,
    DateTime? ShippedAt,
    DateTime? DeliveredAt
);

public record OrderItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string? ProductImage,
    string? VariantName,
    string? SKU,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice
);

public record AddressSnapshotDto(
    string FullName,
    string PhoneNumber,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string State,
    string PostalCode,
    string Country
);

public record CreateOrderDto(
    Guid? AddressId,
    AddressSnapshotDto? NewAddress,
    PaymentMethod PaymentMethod,
    string? CouponCode,
    string? Notes
);

public record UpdateOrderStatusDto(
    OrderStatus Status,
    string? TrackingNumber,
    string? Notes
);

public record OrderListDto(
    Guid Id,
    string OrderNumber,
    OrderStatus Status,
    PaymentStatus PaymentStatus,
    decimal TotalAmount,
    int ItemCount,
    string? PrimaryImage,
    DateTime CreatedAt
);

public record AdminOrderListDto(
    Guid Id,
    string OrderNumber,
    string CustomerName,
    string CustomerEmail,
    string Status,
    string PaymentStatus,
    decimal TotalAmount,
    int ItemCount,
    DateTime CreatedAt
);

public record OrderSummaryDto(
    decimal SubTotal,
    decimal ShippingAmount,
    decimal TaxAmount,
    decimal DiscountAmount,
    decimal TotalAmount,
    string? CouponCode,
    string? CouponDiscount
);
