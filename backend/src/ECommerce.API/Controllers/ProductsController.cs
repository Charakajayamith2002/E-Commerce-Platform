using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.DTOs;
using ECommerce.Application.Features.Products.Commands;
using ECommerce.Application.Features.Products.Queries;
using ECommerce.Application.Features.Reviews.Commands;
using ECommerce.Application.Features.Reviews.Queries;
using ECommerce.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICloudinaryService _cloudinary;
    private readonly IApplicationDbContext _context;

    public ProductsController(IMediator mediator, ICloudinaryService cloudinary, IApplicationDbContext context)
    {
        _mediator = mediator;
        _cloudinary = cloudinary;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] ProductFilterDto filter)
    {
        var result = await _mediator.Send(new GetProductsQuery(filter));
        return Ok(new { succeeded = true, data = result });
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetProduct(string slug)
    {
        var result = await _mediator.Send(new GetProductBySlugQuery(slug));
        if (!result.Succeeded) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> CreateProduct([FromForm] CreateProductFormRequest request)
    {
        if (request.CategoryId == Guid.Empty)
            return BadRequest(new { succeeded = false, message = "Category is required." });

        var dto = new CreateProductDto(
            request.Name, request.ShortDescription, request.Description ?? "",
            request.Price, request.ComparePrice, request.CostPrice,
            request.SKU, request.StockQuantity, request.LowStockThreshold,
            request.IsActive, request.IsFeatured, request.IsDigital,
            request.RequiresShipping, request.Weight, request.CategoryId,
            request.BrandId == Guid.Empty ? null : request.BrandId,
            request.MetaTitle, request.MetaDescription, request.Tags
        );
        var result = await _mediator.Send(new CreateProductCommand(dto, request.Images));
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromForm] UpdateProductFormRequest request)
    {
        var dto = new UpdateProductDto(
            request.Name,
            request.ShortDescription,
            request.Description,
            request.Price,
            request.ComparePrice,
            null,
            request.SKU,
            request.StockQuantity,
            null,
            request.IsActive,
            request.IsFeatured,
            request.CategoryId == Guid.Empty ? null : request.CategoryId,
            request.BrandId == Guid.Empty ? null : request.BrandId,
            null, null,
            request.Tags
        );

        var result = await _mediator.Send(new UpdateProductCommand(id, dto));
        if (!result.Succeeded) return BadRequest(result);

        if (request.Images?.Any() == true)
        {
            var uploads = await _cloudinary.UploadImagesAsync(request.Images, "products");
            var existing = await _context.ProductImages
                .Where(pi => pi.ProductId == id).ToListAsync();
            foreach (var img in existing) img.IsPrimary = false;

            _context.ProductImages.AddRange(uploads.Select((u, i) => new ProductImage
            {
                ProductId = id,
                ImageUrl = u.Url,
                PublicId = u.PublicId,
                IsPrimary = true,
                SortOrder = 0
            }));
            await _context.SaveChangesAsync(CancellationToken.None);
        }

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var result = await _mediator.Send(new DeleteProductCommand(id));
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("{id:guid}/reviews")]
    public async Task<IActionResult> GetReviews(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _mediator.Send(new GetProductReviewsQuery(id, page, pageSize));
        return Ok(new { succeeded = true, data = result });
    }

    [HttpPost("{id:guid}/reviews")]
    [Authorize]
    public async Task<IActionResult> AddReview(Guid id, [FromBody] CreateReviewDto dto)
    {
        var dtoWithId = dto with { ProductId = id };
        var result = await _mediator.Send(new CreateReviewCommand(dtoWithId));
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }
}

public class CreateProductFormRequest
{
    public string Name { get; set; } = "";
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal? ComparePrice { get; set; }
    public decimal? CostPrice { get; set; }
    public string? SKU { get; set; }
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; } = 5;
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }
    public bool IsDigital { get; set; }
    public bool RequiresShipping { get; set; } = true;
    public decimal? Weight { get; set; }
    public Guid CategoryId { get; set; }
    public Guid? BrandId { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? Tags { get; set; }
    public IList<IFormFile>? Images { get; set; }
}

public class UpdateProductFormRequest
{
    public string? Name { get; set; }
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public decimal? ComparePrice { get; set; }
    public string? SKU { get; set; }
    public int? StockQuantity { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsFeatured { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? BrandId { get; set; }
    public string? Tags { get; set; }
    public IList<IFormFile>? Images { get; set; }
}
