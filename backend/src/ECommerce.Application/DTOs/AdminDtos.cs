namespace ECommerce.Application.DTOs;

public record DashboardStatsDto(
    decimal TotalRevenue,
    decimal MonthlyRevenue,
    decimal WeeklyRevenue,
    int TotalOrders,
    int PendingOrders,
    int TotalProducts,
    int LowStockProducts,
    int TotalUsers,
    int NewUsersThisMonth,
    List<RevenueChartDto> RevenueChart,
    List<TopProductDto> TopProducts,
    List<RecentOrderDto> RecentOrders
);

public record RevenueChartDto(string Label, decimal Revenue, int Orders);

public record TopProductDto(
    Guid ProductId,
    string ProductName,
    string? ImageUrl,
    int TotalSold,
    decimal TotalRevenue
);

public record RecentOrderDto(
    Guid OrderId,
    string OrderNumber,
    string CustomerName,
    string CustomerEmail,
    decimal TotalAmount,
    string Status,
    DateTime CreatedAt
);

public record AdminUserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? AvatarUrl,
    bool IsActive,
    bool IsBlocked,
    bool EmailConfirmed,
    List<string> Roles,
    int TotalOrders,
    decimal TotalSpent,
    DateTime CreatedAt,
    DateTime? LastLoginAt
);

public record UserFilterDto(
    string? SearchTerm = null,
    string? Role = null,
    bool? IsActive = null,
    bool? IsBlocked = null,
    string? SortBy = "createdAt",
    string? SortOrder = "desc",
    int PageIndex = 1,
    int PageSize = 20
);

public record InventoryReportDto(
    int TotalProducts,
    int InStockProducts,
    int LowStockProducts,
    int OutOfStockProducts,
    List<LowStockProductDto> LowStockItems
);

public record LowStockProductDto(
    Guid ProductId,
    string ProductName,
    string? SKU,
    int StockQuantity,
    int LowStockThreshold,
    string CategoryName
);

public record SalesReportDto(
    decimal TotalRevenue,
    int TotalOrders,
    decimal AverageOrderValue,
    List<DailySalesDto> DailySales
);

public record DailySalesDto(DateTime Date, decimal Revenue, int Orders);
