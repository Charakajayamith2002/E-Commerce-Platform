using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Features.Orders.Commands;

public record UpdateOrderStatusCommand(Guid OrderId, UpdateOrderStatusDto Dto) : IRequest<Result>;

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;
    private readonly UserManager<ApplicationUser> _userManager;

    public UpdateOrderStatusCommandHandler(
        IApplicationDbContext context,
        IEmailService emailService,
        INotificationService notificationService,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _emailService = emailService;
        _notificationService = notificationService;
        _userManager = userManager;
    }

    public async Task<Result> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == request.OrderId && !o.IsDeleted, cancellationToken);

        if (order == null) return Result.Failure("Order not found.");

        var dto = request.Dto;
        order.Status = dto.Status;
        if (dto.TrackingNumber != null) order.TrackingNumber = dto.TrackingNumber;
        if (dto.Notes != null) order.Notes = dto.Notes;
        order.UpdatedAt = DateTime.UtcNow;

        if (dto.Status == OrderStatus.Shipped) order.ShippedAt = DateTime.UtcNow;
        if (dto.Status == OrderStatus.Delivered) order.DeliveredAt = DateTime.UtcNow;
        if (dto.Status == OrderStatus.Cancelled) order.CancelledAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        // Notify user — fire-and-forget; don't fail the update if email/notifications error
        try
        {
            var user = await _userManager.FindByIdAsync(order.UserId.ToString());
            if (user?.Email != null)
            {
                await _emailService.SendOrderStatusUpdateAsync(user.Email, user.FirstName, order.OrderNumber, dto.Status.ToString());

                if (dto.Status == OrderStatus.Shipped && dto.TrackingNumber != null)
                    await _emailService.SendShippingNotificationAsync(user.Email, user.FirstName, order.OrderNumber, dto.TrackingNumber);
            }

            await _notificationService.SendOrderUpdateAsync(order.UserId, order.OrderNumber, dto.Status.ToString());
        }
        catch { /* email/notification failures should not block the status update */ }

        return Result.Success($"Order status updated to {dto.Status}.");
    }
}
