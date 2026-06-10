namespace ECommerce.Application.DTOs;

public record CategoryDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? ImageUrl,
    Guid? ParentCategoryId,
    string? ParentCategoryName,
    bool IsActive,
    bool IsFeatured,
    int SortOrder,
    int ProductCount,
    List<CategoryDto>? SubCategories
);

public record CreateCategoryDto(
    string Name,
    string? Description,
    Guid? ParentCategoryId,
    bool IsActive = true,
    bool IsFeatured = false,
    int SortOrder = 0,
    string? MetaTitle = null,
    string? MetaDescription = null
);

public record UpdateCategoryDto(
    string? Name,
    string? Description,
    Guid? ParentCategoryId,
    bool? IsActive,
    bool? IsFeatured,
    int? SortOrder,
    string? MetaTitle,
    string? MetaDescription
);

public record BrandDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? LogoUrl,
    string? Website,
    bool IsActive,
    bool IsFeatured,
    int ProductCount
);

public record CreateBrandDto(
    string Name,
    string? Description,
    string? Website,
    bool IsActive = true,
    bool IsFeatured = false
);

public record UpdateBrandDto(
    string? Name,
    string? Description,
    string? Website,
    bool? IsActive,
    bool? IsFeatured
);
