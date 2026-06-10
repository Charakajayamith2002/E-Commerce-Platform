using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Products.Queries;

public record GetProductBySlugQuery(string Slug) : IRequest<Result<ProductDto>>;

public class GetProductBySlugQueryHandler : IRequestHandler<GetProductBySlugQuery, Result<ProductDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProductBySlugQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<ProductDto>> Handle(GetProductBySlugQuery request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images.OrderBy(i => i.SortOrder))
            .Include(p => p.Variants.Where(v => v.IsActive))
            .Where(p => p.Slug == request.Slug && !p.IsDeleted && p.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        if (product == null)
            return Result<ProductDto>.Failure("Product not found.");

        var dto = MapToDto(product);
        return Result<ProductDto>.Success(dto);
    }

    private static ProductDto MapToDto(Domain.Entities.Product p) => new(
        p.Id, p.Name, p.Slug, p.ShortDescription, p.Description,
        p.Price, p.ComparePrice, p.SKU, p.StockQuantity,
        p.IsActive, p.IsFeatured, p.AverageRating, p.ReviewCount, p.SalesCount,
        p.StockQuantity > 0,
        p.CategoryId, p.Category.Name, p.BrandId, p.Brand?.Name,
        p.Images.Select(i => new ProductImageDto(i.Id, i.ImageUrl, i.AltText, i.IsPrimary, i.SortOrder)).ToList(),
        p.Variants.Select(v => new ProductVariantDto(v.Id, v.Name, v.Value, v.SKU, v.PriceModifier, v.StockQuantity, v.ImageUrl, v.IsActive)).ToList(),
        p.Tags, p.CreatedAt
    );
}
