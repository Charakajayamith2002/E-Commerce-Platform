namespace ECommerce.Application.DTOs;

public record ReviewDto(
    Guid Id,
    Guid ProductId,
    Guid UserId,
    string UserName,
    string? UserAvatar,
    int Rating,
    string? Title,
    string Comment,
    bool IsVerifiedPurchase,
    int HelpfulCount,
    DateTime CreatedAt
);

public record CreateReviewDto(
    Guid ProductId,
    int Rating,
    string? Title,
    string Comment
);

public record ReviewSummaryDto(
    double AverageRating,
    int TotalReviews,
    Dictionary<int, int> RatingDistribution
);
