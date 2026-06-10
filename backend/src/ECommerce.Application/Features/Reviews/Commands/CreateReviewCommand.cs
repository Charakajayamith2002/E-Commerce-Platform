using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Reviews.Commands;

public record CreateReviewCommand(CreateReviewDto Dto) : IRequest<Result>;

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CreateReviewCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;
        var userId = _currentUser.UserId!.Value;

        var product = await _context.Products.FindAsync(dto.ProductId);
        if (product == null) return Result.Failure("Product not found.");

        var existingReview = await _context.Reviews
            .AnyAsync(r => r.ProductId == dto.ProductId && r.UserId == userId, cancellationToken);

        if (existingReview)
            return Result.Failure("You have already reviewed this product.");

        // Check if user has purchased the product
        var hasPurchased = await _context.Orders
            .Include(o => o.Items)
            .AnyAsync(o => o.UserId == userId &&
                          o.Items.Any(i => i.ProductId == dto.ProductId), cancellationToken);

        var review = new Review
        {
            ProductId = dto.ProductId,
            UserId = userId,
            Rating = dto.Rating,
            Title = dto.Title,
            Comment = dto.Comment,
            IsVerifiedPurchase = hasPurchased
        };

        _context.Reviews.Add(review);

        // Update product rating
        var allRatings = await _context.Reviews
            .Where(r => r.ProductId == dto.ProductId && r.IsApproved)
            .Select(r => r.Rating)
            .ToListAsync(cancellationToken);

        allRatings.Add(dto.Rating);
        product.AverageRating = Math.Round(allRatings.Average(), 1);
        product.ReviewCount = allRatings.Count;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success("Review submitted successfully.");
    }
}
