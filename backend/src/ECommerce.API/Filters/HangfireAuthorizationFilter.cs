using Hangfire.Dashboard;

namespace ECommerce.API.Filters;

public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();
        return httpContext.User?.IsInRole("Admin") ?? false;
    }
}
