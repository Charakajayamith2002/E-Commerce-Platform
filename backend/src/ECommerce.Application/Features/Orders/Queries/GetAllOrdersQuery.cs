using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Orders.Queries;

public record GetAllOrdersQuery(
    string? Search = null,
    string? Status = null,
    int PageIndex = 1,
    int PageSize = 15
) : IRequest<PaginatedList<AdminOrderListDto>>;

public class GetAllOrdersQueryHandler : IRequestHandler<GetAllOrdersQuery, PaginatedList<AdminOrderListDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllOrdersQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<PaginatedList<AdminOrderListDto>> Handle(GetAllOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Orders
            .Include(o => o.User)
            .Include(o => o.Items)
            .Where(o => !o.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.Trim().ToLower();
            query = query.Where(o =>
                o.OrderNumber.ToLower().Contains(s) ||
                (o.User != null && (o.User.Email!.ToLower().Contains(s) ||
                (o.User.FirstName + " " + o.User.LastName).ToLower().Contains(s))));
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
            query = query.Where(o => o.Status.ToString() == request.Status);

        var projected = query
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new AdminOrderListDto(
                o.Id,
                o.OrderNumber,
                o.User != null ? o.User.FirstName + " " + o.User.LastName : "—",
                o.User != null ? o.User.Email! : "—",
                o.Status.ToString(),
                o.PaymentStatus.ToString(),
                o.TotalAmount,
                o.Items.Count,
                o.CreatedAt
            ));

        return await PaginatedList<AdminOrderListDto>.CreateAsync(projected, request.PageIndex, request.PageSize);
    }
}
