using ECommerce.Application.Common.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Persistence.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public WishlistController(ApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetWishlist()
    {
        var userId = _currentUser.UserId!.Value;
        var items = await _context.WishlistItems
            .Include(w => w.Product).ThenInclude(p => p.Images)
            .Include(w => w.Product).ThenInclude(p => p.Category)
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new
            {
                w.Id, w.ProductId,
                w.Product.Name, w.Product.Slug, w.Product.Price, w.Product.ComparePrice,
                PrimaryImage = w.Product.Images.Where(i => i.IsPrimary).Select(i => i.ImageUrl).FirstOrDefault(),
                w.Product.AverageRating, w.Product.ReviewCount,
                IsInStock = w.Product.StockQuantity > 0,
                CategoryName = w.Product.Category.Name,
                w.CreatedAt
            })
            .ToListAsync();

        return Ok(new { succeeded = true, data = items });
    }

    [HttpPost("{productId:guid}")]
    public async Task<IActionResult> AddToWishlist(Guid productId)
    {
        var userId = _currentUser.UserId!.Value;

        var exists = await _context.WishlistItems
            .AnyAsync(w => w.UserId == userId && w.ProductId == productId);

        if (exists)
            return BadRequest(new { succeeded = false, message = "Product already in wishlist." });

        var product = await _context.Products.FindAsync(productId);
        if (product == null) return NotFound();

        _context.WishlistItems.Add(new WishlistItem { UserId = userId, ProductId = productId });
        await _context.SaveChangesAsync();

        return Ok(new { succeeded = true, message = "Added to wishlist." });
    }

    [HttpDelete("{productId:guid}")]
    public async Task<IActionResult> RemoveFromWishlist(Guid productId)
    {
        var userId = _currentUser.UserId!.Value;
        var item = await _context.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);

        if (item == null) return NotFound();

        _context.WishlistItems.Remove(item);
        await _context.SaveChangesAsync();

        return Ok(new { succeeded = true, message = "Removed from wishlist." });
    }
}
