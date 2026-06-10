using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Cart.Queries;

public record ValidateCouponQuery(string CouponCode) : IRequest<Result<object>>;

public class ValidateCouponQueryHandler : IRequestHandler<ValidateCouponQuery, Result<object>>
{
    private readonly IApplicationDbContext _context;

    public ValidateCouponQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<object>> Handle(ValidateCouponQuery request, CancellationToken cancellationToken)
    {
        var coupon = await _context.Coupons
            .FirstOrDefaultAsync(c => c.Code == request.CouponCode.ToUpper() &&
                c.IsActive && c.StartDate <= DateTime.UtcNow && c.EndDate >= DateTime.UtcNow, cancellationToken);

        if (coupon == null)
            return Result<object>.Failure("Invalid or expired coupon code.");

        if (coupon.UsageLimit.HasValue && coupon.UsageCount >= coupon.UsageLimit.Value)
            return Result<object>.Failure("This coupon has reached its usage limit.");

        var response = new
        {
            code = coupon.Code,
            type = coupon.Type.ToString(),
            discountValue = coupon.DiscountValue,
            minimumOrderAmount = coupon.MinimumOrderAmount,
            maximumDiscountAmount = coupon.MaximumDiscountAmount,
            description = coupon.Description
        };

        return Result<object>.Success(response, "Coupon applied successfully.");
    }
}
