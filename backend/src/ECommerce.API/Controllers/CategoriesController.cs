using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Persistence.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _env;

    public CategoriesController(ApplicationDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories([FromQuery] bool featured = false)
    {
        var query = _context.Categories
            .Include(c => c.SubCategories)
            .Include(c => c.Products)
            .Where(c => !c.IsDeleted && c.IsActive && c.ParentCategoryId == null)
            .OrderBy(c => c.SortOrder);

        if (featured) query = query.Where(c => c.IsFeatured).OrderBy(c => c.SortOrder);

        var categories = await query.ToListAsync();

        var dtos = categories.Select(c => MapCategory(c)).ToList();
        return Ok(new { succeeded = true, data = dtos });
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetCategory(string slug)
    {
        var category = await _context.Categories
            .Include(c => c.SubCategories)
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Slug == slug && !c.IsDeleted);

        if (category == null) return NotFound();

        return Ok(new { succeeded = true, data = MapCategory(category) });
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> CreateCategory([FromForm] CreateCategoryDto dto, [FromForm] IFormFile? image)
    {
        var slug = dto.Name.ToLower().Replace(" ", "-").Replace("&", "and");

        var category = new Category
        {
            Name = dto.Name,
            Slug = slug,
            Description = dto.Description,
            ParentCategoryId = dto.ParentCategoryId,
            IsActive = dto.IsActive,
            IsFeatured = dto.IsFeatured,
            SortOrder = dto.SortOrder,
            MetaTitle = dto.MetaTitle,
            MetaDescription = dto.MetaDescription
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategory), new { slug = category.Slug },
            new { succeeded = true, data = category.Id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateCategoryDto dto)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound();

        if (dto.Name != null) category.Name = dto.Name;
        if (dto.Description != null) category.Description = dto.Description;
        if (dto.IsActive.HasValue) category.IsActive = dto.IsActive.Value;
        if (dto.IsFeatured.HasValue) category.IsFeatured = dto.IsFeatured.Value;
        if (dto.SortOrder.HasValue) category.SortOrder = dto.SortOrder.Value;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { succeeded = true, message = "Category updated." });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound();
        category.IsDeleted = true;
        await _context.SaveChangesAsync();
        return Ok(new { succeeded = true, message = "Category deleted." });
    }

    private static CategoryDto MapCategory(Category c) => new(
        c.Id, c.Name, c.Slug, c.Description, c.ImageUrl,
        c.ParentCategoryId, null, c.IsActive, c.IsFeatured, c.SortOrder,
        c.Products.Count(p => !p.IsDeleted),
        c.SubCategories.Where(s => !s.IsDeleted && s.IsActive)
            .Select(s => new CategoryDto(s.Id, s.Name, s.Slug, s.Description, s.ImageUrl,
                s.ParentCategoryId, c.Name, s.IsActive, s.IsFeatured, s.SortOrder,
                s.Products.Count(p => !p.IsDeleted), null))
            .ToList()
    );
}
