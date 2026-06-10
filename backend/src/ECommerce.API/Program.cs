using ECommerce.API.Extensions;
using ECommerce.API.Filters;
using ECommerce.API.Hubs;
using ECommerce.API.Middleware;
using ECommerce.Application;
using ECommerce.Infrastructure;
using ECommerce.Persistence;
using ECommerce.Persistence.Seeds;
using Hangfire;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();

builder.Host.UseSerilog();

// Add Services
builder.Services.AddApplication();
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);

var app = builder.Build();

// Seed Database
await DataSeeder.SeedAsync(app.Services);

// Middleware Pipeline
app.UseSwaggerDocumentation();
app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseCors("ECommercePolicy");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();

app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireAuthorizationFilter() }
});

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapHub<OrderTrackingHub>("/hubs/orders");

app.MapHealthChecks("/health");

app.Run();
