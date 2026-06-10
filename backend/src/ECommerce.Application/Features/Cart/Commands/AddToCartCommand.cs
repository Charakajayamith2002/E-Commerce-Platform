using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Cart.Commands;

public record AddToCartCommand(AddToCartDto Dto) : IRequest<Result>;

public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public AddToCartCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(AddToCartCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;
        if (!_currentUser.UserId.HasValue)
            return Result.Failure("User not authenticated.");
        var userId = _currentUser.UserId.Value;

        var product = await _context.Products
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == dto.ProductId && !p.IsDeleted && p.IsActive, cancellationToken);

        if (product == null) return Result.Failure("Product not found.");

        var availableStock = dto.VariantId.HasValue
            ? product.Variants.FirstOrDefault(v => v.Id == dto.VariantId.Value)?.StockQuantity ?? 0
            : product.StockQuantity;

        if (dto.Quantity > availableStock)
            return Result.Failure($"Only {availableStock} items available in stock.");

        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

        if (cart == null)
        {
            cart = new Domain.Entities.Cart { UserId = userId };
            _context.Carts.Add(cart);
        }

        var unitPrice = dto.VariantId.HasValue
            ? product.Price + (product.Variants.FirstOrDefault(v => v.Id == dto.VariantId.Value)?.PriceModifier ?? 0)
            : product.Price;

        var existingItem = cart.Items.FirstOrDefault(i =>
            i.ProductId == dto.ProductId && i.VariantId == dto.VariantId);

        if (existingItem != null)
        {
            var newQty = existingItem.Quantity + dto.Quantity;
            if (newQty > availableStock)
                return Result.Failure($"Cannot add more. Max available: {availableStock}");

            existingItem.Quantity = newQty;
            existingItem.TotalPrice = unitPrice * newQty;
            existingItem.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            cart.Items.Add(new CartItem
            {
                CartId = cart.Id,
                ProductId = dto.ProductId,
                VariantId = dto.VariantId,
                Quantity = dto.Quantity,
                UnitPrice = unitPrice,
                TotalPrice = unitPrice * dto.Quantity
            });
        }

        cart.TotalItems = cart.Items.Sum(i => i.Quantity);
        cart.TotalAmount = cart.Items.Sum(i => i.TotalPrice);
        cart.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success("Item added to cart.");
    }
}
