using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Products.Commands;

public record UpdateProductCommand(Guid ProductId, UpdateProductDto Dto) : IRequest<Result>;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateProductCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == request.ProductId && !p.IsDeleted, cancellationToken);

        if (product == null) return Result.Failure("Product not found.");

        var dto = request.Dto;
        if (dto.Name != null) product.Name = dto.Name;
        if (dto.ShortDescription != null) product.ShortDescription = dto.ShortDescription;
        if (dto.Description != null) product.Description = dto.Description;
        if (dto.Price.HasValue) product.Price = dto.Price.Value;
        if (dto.ComparePrice.HasValue) product.ComparePrice = dto.ComparePrice.Value;
        if (dto.CostPrice.HasValue) product.CostPrice = dto.CostPrice.Value;
        if (dto.SKU != null) product.SKU = dto.SKU;
        if (dto.StockQuantity.HasValue) product.StockQuantity = dto.StockQuantity.Value;
        if (dto.LowStockThreshold.HasValue) product.LowStockThreshold = dto.LowStockThreshold.Value;
        if (dto.IsActive.HasValue) product.IsActive = dto.IsActive.Value;
        if (dto.IsFeatured.HasValue) product.IsFeatured = dto.IsFeatured.Value;
        if (dto.CategoryId.HasValue) product.CategoryId = dto.CategoryId.Value;
        if (dto.BrandId.HasValue) product.BrandId = dto.BrandId.Value;
        if (dto.MetaTitle != null) product.MetaTitle = dto.MetaTitle;
        if (dto.MetaDescription != null) product.MetaDescription = dto.MetaDescription;
        if (dto.Tags != null) product.Tags = dto.Tags;

        product.UpdatedAt = DateTime.UtcNow;
        product.UpdatedBy = _currentUser.UserEmail;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success("Product updated successfully.");
    }
}
