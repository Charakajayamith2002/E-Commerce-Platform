namespace ECommerce.Application.DTOs;

public record CartDto(
    Guid Id,
    List<CartItemDto> Items,
    decimal SubTotal,
    decimal ShippingAmount,
    decimal TaxAmount,
    decimal DiscountAmount,
    decimal TotalAmount,
    int TotalItems,
    string? AppliedCouponCode
);

public record CartItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string? ProductImage,
    string? ProductSlug,
    Guid? VariantId,
    string? VariantName,
    string? SKU,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice,
    int MaxStock
);

public record AddToCartDto(
    Guid ProductId,
    Guid? VariantId,
    int Quantity = 1
);

public record UpdateCartItemDto(int Quantity);

public record ApplyCouponDto(string CouponCode);
