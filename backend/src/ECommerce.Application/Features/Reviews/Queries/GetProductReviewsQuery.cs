using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Reviews.Queries;

public record GetProductReviewsQuery(Guid ProductId, int PageIndex = 1, int PageSize = 10) : IRequest<PaginatedList<ReviewDto>>;

public class GetProductReviewsQueryHandler : IRequestHandler<GetProductReviewsQuery, PaginatedList<ReviewDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProductReviewsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<PaginatedList<ReviewDto>> Handle(GetProductReviewsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Reviews
            .Include(r => r.User)
            .Where(r => r.ProductId == request.ProductId && r.IsApproved && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto(
                r.Id, r.ProductId, r.UserId,
                r.User.FirstName + " " + r.User.LastName,
                r.User.AvatarUrl,
                r.Rating, r.Title, r.Comment,
                r.IsVerifiedPurchase, r.HelpfulCount, r.CreatedAt
            ));

        return await PaginatedList<ReviewDto>.CreateAsync(query, request.PageIndex, request.PageSize);
    }
}
