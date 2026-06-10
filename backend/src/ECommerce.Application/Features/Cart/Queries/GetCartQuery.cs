using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Cart.Queries;

public record GetCartQuery : IRequest<Result<CartDto>>;

public class GetCartQueryHandler : IRequestHandler<GetCartQuery, Result<CartDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetCartQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CartDto>> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId!.Value;

        var cart = await _context.Carts
            .Include(c => c.Items).ThenInclude(ci => ci.Product).ThenInclude(p => p.Images)
            .Include(c => c.Items).ThenInclude(ci => ci.Variant)
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

        if (cart == null)
        {
            return Result<CartDto>.Success(new CartDto(Guid.NewGuid(), new(), 0, 0, 0, 0, 0, 0, null));
        }

        var subTotal = cart.Items.Sum(i => i.TotalPrice);
        var shippingAmount = subTotal >= 100m ? 0m : 9.99m;
        var taxAmount = Math.Round(subTotal * 0.08m, 2);
        var totalAmount = subTotal + shippingAmount + taxAmount;

        var items = cart.Items.Select(i => new CartItemDto(
            i.Id,
            i.ProductId,
            i.Product.Name,
            i.Product.Images.Where(img => img.IsPrimary).Select(img => img.ImageUrl).FirstOrDefault()
            ?? i.Product.Images.OrderBy(img => img.SortOrder).Select(img => img.ImageUrl).FirstOrDefault(),
            i.Product.Slug,
            i.VariantId,
            i.Variant?.Name,
            i.Product.SKU,
            i.Quantity,
            i.UnitPrice,
            i.TotalPrice,
            i.VariantId.HasValue ? (i.Variant?.StockQuantity ?? 0) : i.Product.StockQuantity
        )).ToList();

        var dto = new CartDto(cart.Id, items, subTotal, shippingAmount, taxAmount, 0, totalAmount,
            cart.TotalItems, null);

        return Result<CartDto>.Success(dto);
    }
}
