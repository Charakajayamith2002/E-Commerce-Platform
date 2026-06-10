using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Orders.Queries;

public record GetUserOrdersQuery(int PageIndex = 1, int PageSize = 10) : IRequest<PaginatedList<OrderListDto>>;

public class GetUserOrdersQueryHandler : IRequestHandler<GetUserOrdersQuery, PaginatedList<OrderListDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetUserOrdersQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PaginatedList<OrderListDto>> Handle(GetUserOrdersQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId!.Value;

        var query = _context.Orders
            .Include(o => o.Items)
            .Where(o => o.UserId == userId && !o.IsDeleted)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderListDto(
                o.Id, o.OrderNumber, o.Status, o.PaymentStatus,
                o.TotalAmount, o.Items.Count,
                o.Items.Select(i => i.ProductImage).FirstOrDefault(),
                o.CreatedAt
            ));

        return await PaginatedList<OrderListDto>.CreateAsync(query, request.PageIndex, request.PageSize);
    }
}
