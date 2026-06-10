using Microsoft.AspNetCore.Http;

namespace ECommerce.Application.DTOs;

public record ProductDto(
    Guid Id,
    string Name,
    string Slug,
    string? ShortDescription,
    string Description,
    decimal Price,
    decimal? ComparePrice,
    string? SKU,
    int StockQuantity,
    bool IsActive,
    bool IsFeatured,
    double AverageRating,
    int ReviewCount,
    int SalesCount,
    bool IsInStock,
    Guid CategoryId,
    string CategoryName,
    Guid? BrandId,
    string? BrandName,
    List<ProductImageDto> Images,
    List<ProductVariantDto> Variants,
    string? Tags,
    DateTime CreatedAt
);

public record ProductImageDto(
    Guid Id,
    string ImageUrl,
    string? AltText,
    bool IsPrimary,
    int SortOrder
);

public record ProductVariantDto(
    Guid Id,
    string Name,
    string? Value,
    string? SKU,
    decimal? PriceModifier,
    int StockQuantity,
    string? ImageUrl,
    bool IsActive
);

public record CreateProductDto(
    string Name,
    string? ShortDescription,
    string Description,
    decimal Price,
    decimal? ComparePrice,
    decimal? CostPrice,
    string? SKU,
    int StockQuantity,
    int LowStockThreshold,
    bool IsActive,
    bool IsFeatured,
    bool IsDigital,
    bool RequiresShipping,
    decimal? Weight,
    Guid CategoryId,
    Guid? BrandId,
    string? MetaTitle,
    string? MetaDescription,
    string? Tags,
    List<CreateProductVariantDto>? Variants = null
);

public record UpdateProductDto(
    string? Name,
    string? ShortDescription,
    string? Description,
    decimal? Price,
    decimal? ComparePrice,
    decimal? CostPrice,
    string? SKU,
    int? StockQuantity,
    int? LowStockThreshold,
    bool? IsActive,
    bool? IsFeatured,
    Guid? CategoryId,
    Guid? BrandId,
    string? MetaTitle,
    string? MetaDescription,
    string? Tags
);

public record CreateProductVariantDto(
    string Name,
    string? Value,
    string? SKU,
    decimal? PriceModifier,
    int StockQuantity
);

public record ProductFilterDto(
    string? SearchTerm = null,
    Guid? CategoryId = null,
    Guid? BrandId = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    double? MinRating = null,
    bool? IsActive = null,
    bool? IsFeatured = null,
    bool? InStock = null,
    string? SortBy = "createdAt",
    string? SortOrder = "desc",
    int PageIndex = 1,
    int PageSize = 12
);

public record ProductListDto(
    Guid Id,
    string Name,
    string Slug,
    string? ShortDescription,
    decimal Price,
    decimal? ComparePrice,
    string? PrimaryImageUrl,
    double AverageRating,
    int ReviewCount,
    bool IsInStock,
    bool IsFeatured,
    string CategoryName,
    string? BrandName,
    int StockQuantity
);
