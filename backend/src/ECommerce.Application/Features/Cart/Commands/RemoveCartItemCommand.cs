using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Cart.Commands;

public record RemoveCartItemCommand(Guid CartItemId) : IRequest<Result>;

public class RemoveCartItemCommandHandler : IRequestHandler<RemoveCartItemCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public RemoveCartItemCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(RemoveCartItemCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId!.Value;

        var cartItem = await _context.CartItems
            .Include(ci => ci.Cart)
            .FirstOrDefaultAsync(ci => ci.Id == request.CartItemId && ci.Cart.UserId == userId, cancellationToken);

        if (cartItem == null) return Result.Failure("Cart item not found.");

        _context.CartItems.Remove(cartItem);

        var cart = cartItem.Cart;
        cart.TotalItems -= cartItem.Quantity;
        cart.TotalAmount -= cartItem.TotalPrice;
        cart.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success("Item removed from cart.");
    }
}
