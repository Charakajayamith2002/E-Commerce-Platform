using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Orders.Commands;

public record CreateOrderCommand(CreateOrderDto Dto) : IRequest<Result<Guid>>;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;

    public CreateOrderCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IEmailService emailService,
        INotificationService notificationService)
    {
        _context = context;
        _currentUser = currentUser;
        _emailService = emailService;
        _notificationService = notificationService;
    }

    public async Task<Result<Guid>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId!.Value;
        var dto = request.Dto;

        var cart = await _context.Carts
            .Include(c => c.Items).ThenInclude(ci => ci.Product).ThenInclude(p => p.Images)
            .Include(c => c.Items).ThenInclude(ci => ci.Variant)
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

        if (cart == null || !cart.Items.Any())
            return Result<Guid>.Failure("Your cart is empty.");

        // Verify stock availability
        foreach (var item in cart.Items)
        {
            var availableStock = item.VariantId.HasValue
                ? item.Variant?.StockQuantity ?? 0
                : item.Product.StockQuantity;

            if (item.Quantity > availableStock)
                return Result<Guid>.Failure($"Insufficient stock for {item.Product.Name}. Available: {availableStock}");
        }

        // Resolve shipping address
        AddressSnapshotDto? shippingAddress = dto.NewAddress;
        if (dto.AddressId.HasValue && shippingAddress == null)
        {
            var addr = await _context.Addresses
                .FirstOrDefaultAsync(a => a.Id == dto.AddressId.Value && a.UserId == userId, cancellationToken);
            if (addr == null) return Result<Guid>.Failure("Address not found.");
            shippingAddress = new AddressSnapshotDto(addr.FullName, addr.PhoneNumber, addr.AddressLine1,
                addr.AddressLine2, addr.City, addr.State, addr.PostalCode, addr.Country);
        }

        if (shippingAddress == null)
            return Result<Guid>.Failure("Shipping address is required.");

        // Calculate totals
        var subTotal = cart.Items.Sum(i => i.TotalPrice);
        var shippingAmount = subTotal >= 100m ? 0m : 9.99m;
        var taxAmount = Math.Round(subTotal * 0.08m, 2);
        var discountAmount = 0m;

        // Apply coupon if provided
        if (!string.IsNullOrWhiteSpace(dto.CouponCode))
        {
            var coupon = await _context.Coupons
                .FirstOrDefaultAsync(c => c.Code == dto.CouponCode && c.IsActive &&
                    c.StartDate <= DateTime.UtcNow && c.EndDate >= DateTime.UtcNow, cancellationToken);

            if (coupon != null && (coupon.MinimumOrderAmount == null || subTotal >= coupon.MinimumOrderAmount))
            {
                discountAmount = coupon.Type switch
                {
                    CouponType.Percentage => Math.Round(subTotal * coupon.DiscountValue / 100, 2),
                    CouponType.FixedAmount => Math.Min(coupon.DiscountValue, subTotal),
                    CouponType.FreeShipping => shippingAmount,
                    _ => 0m
                };

                if (coupon.MaximumDiscountAmount.HasValue)
                    discountAmount = Math.Min(discountAmount, coupon.MaximumDiscountAmount.Value);

                coupon.UsageCount++;
            }
        }

        var totalAmount = subTotal + shippingAmount + taxAmount - discountAmount;

        var user = await _context.Users.FindAsync(userId);
        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

        var order = new Order
        {
            OrderNumber = orderNumber,
            UserId = userId,
            Status = OrderStatus.Pending,
            PaymentMethod = dto.PaymentMethod,
            SubTotal = subTotal,
            ShippingAmount = shippingAmount,
            TaxAmount = taxAmount,
            DiscountAmount = discountAmount,
            TotalAmount = totalAmount,
            CouponCode = dto.CouponCode,
            Notes = dto.Notes,
            ShippingFullName = shippingAddress.FullName,
            ShippingPhone = shippingAddress.PhoneNumber,
            ShippingAddressLine1 = shippingAddress.AddressLine1,
            ShippingAddressLine2 = shippingAddress.AddressLine2,
            ShippingCity = shippingAddress.City,
            ShippingState = shippingAddress.State,
            ShippingPostalCode = shippingAddress.PostalCode,
            ShippingCountry = shippingAddress.Country
        };

        order.Items = cart.Items.Select(ci => new OrderItem
        {
            OrderId = order.Id,
            ProductId = ci.ProductId,
            VariantId = ci.VariantId,
            ProductName = ci.Product.Name,
            ProductImage = ci.Product.Images.Where(i => i.IsPrimary).Select(i => i.ImageUrl).FirstOrDefault(),
            VariantName = ci.Variant?.Name,
            SKU = ci.Product.SKU,
            Quantity = ci.Quantity,
            UnitPrice = ci.UnitPrice,
            TotalPrice = ci.TotalPrice
        }).ToList();

        // Update product stock
        foreach (var item in cart.Items)
        {
            if (item.VariantId.HasValue && item.Variant != null)
                item.Variant.StockQuantity -= item.Quantity;
            else
                item.Product.StockQuantity -= item.Quantity;

            item.Product.SalesCount += item.Quantity;
        }

        _context.Orders.Add(order);

        // Clear cart
        _context.CartItems.RemoveRange(cart.Items);
        cart.TotalAmount = 0;
        cart.TotalItems = 0;

        await _context.SaveChangesAsync(cancellationToken);

        // Send notifications
        if (user?.Email != null)
            await _emailService.SendOrderConfirmationAsync(user.Email, user.FirstName, orderNumber, totalAmount);

        await _notificationService.SendNotificationAsync(userId, "Order Placed",
            $"Your order #{orderNumber} has been placed successfully.", "order", $"/orders/{order.Id}");

        return Result<Guid>.Success(order.Id, "Order placed successfully.");
    }
}
