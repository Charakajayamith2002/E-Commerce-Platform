using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace ECommerce.Application.Features.Products.Commands;

public record CreateProductCommand(CreateProductDto Dto, IList<IFormFile>? Images = null) : IRequest<Result<Guid>>;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICloudinaryService _cloudinary;
    private readonly ICurrentUserService _currentUser;

    public CreateProductCommandHandler(
        IApplicationDbContext context,
        ICloudinaryService cloudinary,
        ICurrentUserService currentUser)
    {
        _context = context;
        _cloudinary = cloudinary;
        _currentUser = currentUser;
    }

    public async Task<Result<Guid>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        var slug = GenerateSlug(dto.Name);

        var product = new Product
        {
            Name = dto.Name,
            Slug = slug,
            ShortDescription = dto.ShortDescription,
            Description = dto.Description,
            Price = dto.Price,
            ComparePrice = dto.ComparePrice,
            CostPrice = dto.CostPrice,
            SKU = dto.SKU,
            StockQuantity = dto.StockQuantity,
            LowStockThreshold = dto.LowStockThreshold,
            IsActive = dto.IsActive,
            IsFeatured = dto.IsFeatured,
            IsDigital = dto.IsDigital,
            RequiresShipping = dto.RequiresShipping,
            Weight = dto.Weight,
            CategoryId = dto.CategoryId,
            BrandId = dto.BrandId,
            MetaTitle = dto.MetaTitle,
            MetaDescription = dto.MetaDescription,
            Tags = dto.Tags,
            CreatedBy = _currentUser.UserEmail
        };

        if (dto.Variants?.Any() == true)
        {
            product.Variants = dto.Variants.Select((v, i) => new ProductVariant
            {
                Name = v.Name,
                Value = v.Value,
                SKU = v.SKU,
                PriceModifier = v.PriceModifier,
                StockQuantity = v.StockQuantity,
                SortOrder = i,
                ProductId = product.Id
            }).ToList();
        }

        _context.Products.Add(product);

        if (request.Images?.Any() == true)
        {
            var uploads = await _cloudinary.UploadImagesAsync(request.Images, "products");
            var images = uploads.Select((u, i) => new ProductImage
            {
                ProductId = product.Id,
                ImageUrl = u.Url,
                PublicId = u.PublicId,
                IsPrimary = i == 0,
                SortOrder = i
            }).ToList();
            _context.ProductImages.AddRange(images);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(product.Id, "Product created successfully.");
    }

    private static string GenerateSlug(string name) =>
        name.ToLower()
            .Replace(" ", "-")
            .Replace("&", "and")
            .Replace(",", "")
            .Replace(".", "")
            .Replace("'", "")
            .Replace("\"", "") + "-" + Guid.NewGuid().ToString("N")[..6];
}
