using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Products.Queries;

public record GetProductsQuery(ProductFilterDto Filter) : IRequest<PaginatedList<ProductListDto>>;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, PaginatedList<ProductListDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProductsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<PaginatedList<ProductListDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var filter = request.Filter;

        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Where(p => !p.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            query = query.Where(p => p.Name.Contains(filter.SearchTerm) ||
                                     (p.Description != null && p.Description.Contains(filter.SearchTerm)) ||
                                     (p.SKU != null && p.SKU.Contains(filter.SearchTerm)));

        if (filter.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == filter.CategoryId.Value);

        if (filter.BrandId.HasValue)
            query = query.Where(p => p.BrandId == filter.BrandId.Value);

        if (filter.MinPrice.HasValue)
            query = query.Where(p => p.Price >= filter.MinPrice.Value);

        if (filter.MaxPrice.HasValue)
            query = query.Where(p => p.Price <= filter.MaxPrice.Value);

        if (filter.MinRating.HasValue)
            query = query.Where(p => p.AverageRating >= filter.MinRating.Value);

        if (filter.IsActive.HasValue)
            query = query.Where(p => p.IsActive == filter.IsActive.Value);
        else
            query = query.Where(p => p.IsActive);

        if (filter.IsFeatured.HasValue)
            query = query.Where(p => p.IsFeatured == filter.IsFeatured.Value);

        if (filter.InStock.HasValue && filter.InStock.Value)
            query = query.Where(p => p.StockQuantity > 0);

        query = (filter.SortBy?.ToLower(), filter.SortOrder?.ToLower()) switch
        {
            ("price", "asc") => query.OrderBy(p => p.Price),
            ("price", _) => query.OrderByDescending(p => p.Price),
            ("name", "asc") => query.OrderBy(p => p.Name),
            ("name", _) => query.OrderByDescending(p => p.Name),
            ("rating", _) => query.OrderByDescending(p => p.AverageRating),
            ("sales", _) => query.OrderByDescending(p => p.SalesCount),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var projected = query.Select(p => new ProductListDto(
            p.Id, p.Name, p.Slug, p.ShortDescription, p.Price, p.ComparePrice,
            p.Images.Where(i => i.IsPrimary).Select(i => i.ImageUrl).FirstOrDefault()
            ?? p.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).FirstOrDefault(),
            p.AverageRating, p.ReviewCount,
            p.StockQuantity > 0, p.IsFeatured,
            p.Category.Name, p.Brand != null ? p.Brand.Name : null,
            p.StockQuantity
        ));

        return await PaginatedList<ProductListDto>.CreateAsync(projected, filter.PageIndex, filter.PageSize);
    }
}
