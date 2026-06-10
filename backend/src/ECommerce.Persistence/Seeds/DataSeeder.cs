using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Persistence.Context;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace ECommerce.Persistence.Seeds;

public static class DataSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        try
        {
            await context.Database.MigrateAsync();
            await SeedRolesAsync(roleManager);
            await SeedAdminUserAsync(userManager);
            await SeedCategoriesAsync(context);
            await SeedBrandsAsync(context);
            await SeedProductsAsync(context);
            await SeedCouponsAsync(context);
            logger.LogInformation("Database seeded successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
        }
    }

    private static async Task SeedRolesAsync(RoleManager<IdentityRole<Guid>> roleManager)
    {
        string[] roles = { "Admin", "Customer", "Manager" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
        }
    }

    private static async Task SeedAdminUserAsync(UserManager<ApplicationUser> userManager)
    {
        const string adminEmail = "admin@ecommerce.com";
        if (await userManager.FindByEmailAsync(adminEmail) != null) return;

        var admin = new ApplicationUser
        {
            FirstName = "Admin",
            LastName = "User",
            Email = adminEmail,
            UserName = adminEmail,
            EmailConfirmed = true,
            IsActive = true
        };

        var result = await userManager.CreateAsync(admin, "Admin@123456");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(admin, "Admin");
        }
    }

    private static async Task SeedCategoriesAsync(ApplicationDbContext context)
    {
        if (await context.Categories.AnyAsync()) return;

        var categories = new List<Category>
        {
            new() { Name = "Electronics", Slug = "electronics", Description = "Latest electronic gadgets", IsActive = true, IsFeatured = true, SortOrder = 1 },
            new() { Name = "Clothing", Slug = "clothing", Description = "Fashion for everyone", IsActive = true, IsFeatured = true, SortOrder = 2 },
            new() { Name = "Home & Garden", Slug = "home-garden", Description = "Everything for your home", IsActive = true, IsFeatured = true, SortOrder = 3 },
            new() { Name = "Sports & Outdoors", Slug = "sports-outdoors", Description = "Sports equipment and outdoor gear", IsActive = true, IsFeatured = false, SortOrder = 4 },
            new() { Name = "Books", Slug = "books", Description = "Books, magazines and more", IsActive = true, IsFeatured = false, SortOrder = 5 },
            new() { Name = "Beauty & Health", Slug = "beauty-health", Description = "Beauty and health products", IsActive = true, IsFeatured = true, SortOrder = 6 },
            new() { Name = "Toys & Games", Slug = "toys-games", Description = "Fun for all ages", IsActive = true, IsFeatured = false, SortOrder = 7 },
            new() { Name = "Automotive", Slug = "automotive", Description = "Auto parts and accessories", IsActive = true, IsFeatured = false, SortOrder = 8 },
        };

        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync();
    }

    private static async Task SeedBrandsAsync(ApplicationDbContext context)
    {
        if (await context.Brands.AnyAsync()) return;

        var brands = new List<Brand>
        {
            new() { Name = "Apple", Slug = "apple", Description = "Think Different", IsActive = true, IsFeatured = true },
            new() { Name = "Samsung", Slug = "samsung", Description = "Do What You Can't", IsActive = true, IsFeatured = true },
            new() { Name = "Sony", Slug = "sony", Description = "Be Moved", IsActive = true, IsFeatured = true },
            new() { Name = "Nike", Slug = "nike", Description = "Just Do It", IsActive = true, IsFeatured = true },
            new() { Name = "Adidas", Slug = "adidas", Description = "Impossible Is Nothing", IsActive = true, IsFeatured = true },
            new() { Name = "LG", Slug = "lg", Description = "Life's Good", IsActive = true, IsFeatured = false },
            new() { Name = "Philips", Slug = "philips", Description = "Innovation and You", IsActive = true, IsFeatured = false },
            new() { Name = "Generic", Slug = "generic", Description = "Quality Products", IsActive = true, IsFeatured = false },
        };

        await context.Brands.AddRangeAsync(brands);
        await context.SaveChangesAsync();
    }

    private static async Task SeedProductsAsync(ApplicationDbContext context)
    {
        if (await context.Products.AnyAsync()) return;

        var electronicsCategory = await context.Categories.FirstAsync(c => c.Slug == "electronics");
        var clothingCategory = await context.Categories.FirstAsync(c => c.Slug == "clothing");
        var homeCategory = await context.Categories.FirstAsync(c => c.Slug == "home-garden");

        var appleId = (await context.Brands.FirstAsync(b => b.Slug == "apple")).Id;
        var samsungId = (await context.Brands.FirstAsync(b => b.Slug == "samsung")).Id;
        var nikeId = (await context.Brands.FirstAsync(b => b.Slug == "nike")).Id;

        var products = new List<Product>
        {
            new()
            {
                Name = "iPhone 15 Pro Max",
                Slug = "iphone-15-pro-max",
                ShortDescription = "The most powerful iPhone ever made",
                Description = "Experience the ultimate in smartphone technology with the iPhone 15 Pro Max. Features the A17 Pro chip, titanium design, and an advanced camera system.",
                Price = 1199.99m, ComparePrice = 1399.99m, SKU = "IPH-15-PM",
                StockQuantity = 150, IsActive = true, IsFeatured = true,
                CategoryId = electronicsCategory.Id, BrandId = appleId,
                Tags = "iphone,apple,smartphone,5g", AverageRating = 4.8,
                ReviewCount = 324, SalesCount = 892
            },
            new()
            {
                Name = "Samsung Galaxy S24 Ultra",
                Slug = "samsung-galaxy-s24-ultra",
                ShortDescription = "The ultimate Galaxy experience",
                Description = "The Samsung Galaxy S24 Ultra redefines what's possible with its 200MP camera, built-in S Pen, and Snapdragon 8 Gen 3 processor.",
                Price = 1099.99m, ComparePrice = 1299.99m, SKU = "SAM-S24-U",
                StockQuantity = 200, IsActive = true, IsFeatured = true,
                CategoryId = electronicsCategory.Id, BrandId = samsungId,
                Tags = "samsung,galaxy,smartphone,s-pen", AverageRating = 4.7,
                ReviewCount = 256, SalesCount = 673
            },
            new()
            {
                Name = "Apple MacBook Pro 16-inch M3 Pro",
                Slug = "macbook-pro-16-m3-pro",
                ShortDescription = "Outrageous performance. Exceptional battery life.",
                Description = "MacBook Pro with M3 Pro chip delivers outrageous performance for demanding workflows. With up to 18 hours of battery life, you can work anywhere.",
                Price = 2499.99m, ComparePrice = 2799.99m, SKU = "MBP-16-M3P",
                StockQuantity = 75, IsActive = true, IsFeatured = true,
                CategoryId = electronicsCategory.Id, BrandId = appleId,
                Tags = "macbook,apple,laptop,m3", AverageRating = 4.9,
                ReviewCount = 178, SalesCount = 342
            },
            new()
            {
                Name = "Nike Air Max 270",
                Slug = "nike-air-max-270",
                ShortDescription = "Maximum Air cushioning for all-day comfort",
                Description = "The Nike Air Max 270 delivers a supremely comfortable ride with its large Max Air unit. Perfect for everyday wear.",
                Price = 149.99m, ComparePrice = 199.99m, SKU = "NK-AM270",
                StockQuantity = 300, IsActive = true, IsFeatured = true,
                CategoryId = clothingCategory.Id, BrandId = nikeId,
                Tags = "nike,shoes,running,air-max", AverageRating = 4.6,
                ReviewCount = 542, SalesCount = 1234
            },
            new()
            {
                Name = "Samsung 65\" QLED 4K Smart TV",
                Slug = "samsung-65-qled-4k-tv",
                ShortDescription = "Brilliant QLED display with stunning 4K picture quality",
                Description = "Experience stunning picture quality with Samsung's QLED technology. Features Quantum Dot technology, HDR, and smart TV capabilities.",
                Price = 1299.99m, ComparePrice = 1799.99m, SKU = "SAM-TV-65Q",
                StockQuantity = 50, IsActive = true, IsFeatured = false,
                CategoryId = electronicsCategory.Id, BrandId = samsungId,
                Tags = "samsung,tv,qled,4k,smart-tv", AverageRating = 4.7,
                ReviewCount = 189, SalesCount = 234
            },
            new()
            {
                Name = "Luxury Bedding Set - King Size",
                Slug = "luxury-bedding-set-king",
                ShortDescription = "Hotel-quality comfort for your bedroom",
                Description = "Transform your bedroom with this premium 1000 thread count Egyptian cotton bedding set. Includes duvet cover, fitted sheet, and pillowcases.",
                Price = 199.99m, ComparePrice = 299.99m, SKU = "BED-LUX-K",
                StockQuantity = 100, IsActive = true, IsFeatured = false,
                CategoryId = homeCategory.Id, BrandId = null,
                Tags = "bedding,bedroom,luxury,cotton", AverageRating = 4.5,
                ReviewCount = 87, SalesCount = 156
            },
        };

        await context.Products.AddRangeAsync(products);
        await context.SaveChangesAsync();
    }

    private static async Task SeedCouponsAsync(ApplicationDbContext context)
    {
        if (await context.Coupons.AnyAsync()) return;

        var coupons = new List<Coupon>
        {
            new()
            {
                Code = "WELCOME10",
                Description = "10% off for new customers",
                Type = CouponType.Percentage,
                DiscountValue = 10,
                MinimumOrderAmount = 50,
                MaximumDiscountAmount = 100,
                IsActive = true,
                StartDate = DateTime.UtcNow.AddDays(-30),
                EndDate = DateTime.UtcNow.AddDays(365),
                UsageLimit = 1000,
                ApplicableToAllProducts = true
            },
            new()
            {
                Code = "SAVE20",
                Description = "$20 off on orders over $100",
                Type = CouponType.FixedAmount,
                DiscountValue = 20,
                MinimumOrderAmount = 100,
                IsActive = true,
                StartDate = DateTime.UtcNow.AddDays(-7),
                EndDate = DateTime.UtcNow.AddDays(30),
                UsageLimit = 500,
                ApplicableToAllProducts = true
            },
            new()
            {
                Code = "FREESHIP",
                Description = "Free shipping on any order",
                Type = CouponType.FreeShipping,
                DiscountValue = 0,
                IsActive = true,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(14),
                UsageLimit = 200,
                ApplicableToAllProducts = true
            },
        };

        await context.Coupons.AddRangeAsync(coupons);
        await context.SaveChangesAsync();
    }
}
