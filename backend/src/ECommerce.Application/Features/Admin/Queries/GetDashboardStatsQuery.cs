using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Admin.Queries;

public record GetDashboardStatsQuery : IRequest<DashboardStatsDto>;

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private readonly IApplicationDbContext _context;

    public GetDashboardStatsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfWeek = now.AddDays(-(int)now.DayOfWeek).Date.ToUniversalTime();
        var last30Days = now.AddDays(-30);

        var completedStatuses = new[] { OrderStatus.Delivered, OrderStatus.Shipped, OrderStatus.Processing, OrderStatus.Confirmed };

        var totalRevenue = await _context.Orders
            .Where(o => completedStatuses.Contains(o.Status))
            .SumAsync(o => o.TotalAmount, cancellationToken);

        var monthlyRevenue = await _context.Orders
            .Where(o => o.CreatedAt >= startOfMonth && completedStatuses.Contains(o.Status))
            .SumAsync(o => o.TotalAmount, cancellationToken);

        var weeklyRevenue = await _context.Orders
            .Where(o => o.CreatedAt >= startOfWeek && completedStatuses.Contains(o.Status))
            .SumAsync(o => o.TotalAmount, cancellationToken);

        var totalOrders = await _context.Orders.CountAsync(o => !o.IsDeleted, cancellationToken);
        var pendingOrders = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Pending, cancellationToken);

        var totalProducts = await _context.Products.CountAsync(p => !p.IsDeleted, cancellationToken);
        var lowStockProducts = await _context.Products
            .CountAsync(p => !p.IsDeleted && p.TrackInventory && p.StockQuantity <= p.LowStockThreshold, cancellationToken);

        var totalUsers = await _context.Users.CountAsync(cancellationToken);
        var newUsersThisMonth = await _context.Users
            .CountAsync(u => u.CreatedAt >= startOfMonth, cancellationToken);

        // Revenue chart (last 7 days)
        var revenueChart = new List<RevenueChartDto>();
        for (int i = 6; i >= 0; i--)
        {
            var day = now.AddDays(-i).Date;
            var dayEnd = day.AddDays(1);
            var dayRevenue = await _context.Orders
                .Where(o => o.CreatedAt >= day && o.CreatedAt < dayEnd && completedStatuses.Contains(o.Status))
                .SumAsync(o => (decimal?)o.TotalAmount ?? 0, cancellationToken);
            var dayOrders = await _context.Orders
                .CountAsync(o => o.CreatedAt >= day && o.CreatedAt < dayEnd, cancellationToken);
            revenueChart.Add(new RevenueChartDto(day.ToString("MMM dd"), dayRevenue, dayOrders));
        }

        // Top products
        var topProducts = await _context.OrderItems
            .Include(oi => oi.Product).ThenInclude(p => p.Images)
            .GroupBy(oi => new { oi.ProductId, oi.ProductName })
            .Select(g => new TopProductDto(
                g.Key.ProductId,
                g.Key.ProductName,
                g.First().Product.Images.Where(i => i.IsPrimary).Select(i => i.ImageUrl).FirstOrDefault(),
                g.Sum(oi => oi.Quantity),
                g.Sum(oi => oi.TotalPrice)
            ))
            .OrderByDescending(p => p.TotalSold)
            .Take(5)
            .ToListAsync(cancellationToken);

        // Recent orders
        var recentOrders = await _context.Orders
            .Include(o => o.User)
            .OrderByDescending(o => o.CreatedAt)
            .Take(10)
            .Select(o => new RecentOrderDto(
                o.Id, o.OrderNumber,
                o.User.FirstName + " " + o.User.LastName,
                o.User.Email!,
                o.TotalAmount, o.Status.ToString(), o.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return new DashboardStatsDto(
            totalRevenue, monthlyRevenue, weeklyRevenue,
            totalOrders, pendingOrders,
            totalProducts, lowStockProducts,
            totalUsers, newUsersThisMonth,
            revenueChart, topProducts, recentOrders
        );
    }
}
