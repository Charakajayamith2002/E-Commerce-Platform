using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Cart.Commands;

public record UpdateCartItemCommand(Guid CartItemId, int Quantity) : IRequest<Result>;

public class UpdateCartItemCommandHandler : IRequestHandler<UpdateCartItemCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateCartItemCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(UpdateCartItemCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId!.Value;

        var cartItem = await _context.CartItems
            .Include(ci => ci.Cart)
            .Include(ci => ci.Product)
            .Include(ci => ci.Variant)
            .FirstOrDefaultAsync(ci => ci.Id == request.CartItemId && ci.Cart.UserId == userId, cancellationToken);

        if (cartItem == null) return Result.Failure("Cart item not found.");

        if (request.Quantity <= 0)
        {
            _context.CartItems.Remove(cartItem);
        }
        else
        {
            var availableStock = cartItem.VariantId.HasValue
                ? cartItem.Variant?.StockQuantity ?? 0
                : cartItem.Product.StockQuantity;

            if (request.Quantity > availableStock)
                return Result.Failure($"Only {availableStock} items available.");

            cartItem.Quantity = request.Quantity;
            cartItem.TotalPrice = cartItem.UnitPrice * request.Quantity;
            cartItem.UpdatedAt = DateTime.UtcNow;
        }

        var cart = cartItem.Cart;
        var allItems = await _context.CartItems
            .Where(ci => ci.CartId == cart.Id && ci.Id != cartItem.Id)
            .ToListAsync(cancellationToken);

        cart.TotalItems = allItems.Sum(i => i.Quantity) + (request.Quantity > 0 ? request.Quantity : 0);
        cart.TotalAmount = allItems.Sum(i => i.TotalPrice) + (request.Quantity > 0 ? cartItem.TotalPrice : 0);
        cart.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success("Cart updated.");
    }
}
