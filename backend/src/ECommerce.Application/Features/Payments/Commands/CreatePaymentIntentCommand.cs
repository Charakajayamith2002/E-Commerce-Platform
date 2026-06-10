using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Payments.Commands;

public record CreatePaymentIntentCommand(Guid OrderId) : IRequest<Result<PaymentIntentResponseDto>>;

public class CreatePaymentIntentCommandHandler : IRequestHandler<CreatePaymentIntentCommand, Result<PaymentIntentResponseDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IStripeService _stripeService;
    private readonly ICurrentUserService _currentUser;

    public CreatePaymentIntentCommandHandler(
        IApplicationDbContext context,
        IStripeService stripeService,
        ICurrentUserService currentUser)
    {
        _context = context;
        _stripeService = stripeService;
        _currentUser = currentUser;
    }

    public async Task<Result<PaymentIntentResponseDto>> Handle(CreatePaymentIntentCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId!.Value;

        var order = await _context.Orders
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId && o.UserId == userId, cancellationToken);

        if (order == null)
            return Result<PaymentIntentResponseDto>.Failure("Order not found.");

        var clientSecret = await _stripeService.CreatePaymentIntentAsync(
            order.TotalAmount, "usd", order.OrderNumber, order.User.Email!);

        var paymentIntentId = clientSecret.Split("_secret_")[0];
        order.StripePaymentIntentId = paymentIntentId;
        await _context.SaveChangesAsync(cancellationToken);

        var response = new PaymentIntentResponseDto(clientSecret, paymentIntentId, order.TotalAmount, "USD");
        return Result<PaymentIntentResponseDto>.Success(response);
    }
}
