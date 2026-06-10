using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Orders.Queries;

public record GetOrderByIdQuery(Guid OrderId) : IRequest<Result<OrderDto>>;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, Result<OrderDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetOrderByIdQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<OrderDto>> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId!.Value;
        var isAdmin = _currentUser.IsInRole("Admin");

        var order = await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.Id == request.OrderId && !o.IsDeleted &&
                        (isAdmin || o.UserId == userId))
            .FirstOrDefaultAsync(cancellationToken);

        if (order == null) return Result<OrderDto>.Failure("Order not found.");

        var dto = new OrderDto(
            order.Id, order.OrderNumber, order.Status, order.PaymentMethod,
            order.PaymentStatus, order.SubTotal, order.ShippingAmount, order.TaxAmount,
            order.DiscountAmount, order.TotalAmount, order.CouponCode, order.TrackingNumber, order.Notes,
            new AddressSnapshotDto(order.ShippingFullName, order.ShippingPhone, order.ShippingAddressLine1,
                order.ShippingAddressLine2, order.ShippingCity, order.ShippingState,
                order.ShippingPostalCode, order.ShippingCountry),
            order.Items.Select(i => new OrderItemDto(i.Id, i.ProductId, i.ProductName, i.ProductImage,
                i.VariantName, i.SKU, i.Quantity, i.UnitPrice, i.TotalPrice)).ToList(),
            order.CreatedAt, order.ShippedAt, order.DeliveredAt
        );

        return Result<OrderDto>.Success(dto);
    }
}
