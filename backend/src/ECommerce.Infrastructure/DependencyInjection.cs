using ECommerce.Application.Common.Interfaces;
using ECommerce.Infrastructure.Services.Auth;
using ECommerce.Infrastructure.Services.Cache;
using ECommerce.Infrastructure.Services.Email;
using ECommerce.Infrastructure.Services.Payment;
using ECommerce.Infrastructure.Services.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Token Service
        services.AddScoped<ITokenService, TokenService>();

        // Email Service
        services.AddScoped<IEmailService, EmailService>();

        // Cloudinary
        services.AddScoped<ICloudinaryService, CloudinaryService>();

        // Stripe
        services.AddScoped<IStripeService, StripeService>();

        // Redis Cache
        var redisConnection = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrEmpty(redisConnection))
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnection;
                options.InstanceName = "ECommerce:";
            });
            services.AddScoped<ICacheService, RedisCacheService>();
        }
        else
        {
            services.AddDistributedMemoryCache();
            services.AddScoped<ICacheService, RedisCacheService>();
        }

        return services;
    }
}
