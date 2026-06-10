using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Product : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? ComparePrice { get; set; }
    public decimal? CostPrice { get; set; }
    public string? SKU { get; set; }
    public string? Barcode { get; set; }
    public int StockQuantity { get; set; } = 0;
    public int LowStockThreshold { get; set; } = 10;
    public bool TrackInventory { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
    public bool IsDigital { get; set; } = false;
    public bool RequiresShipping { get; set; } = true;
    public decimal? Weight { get; set; }
    public string? WeightUnit { get; set; }
    public double AverageRating { get; set; } = 0;
    public int ReviewCount { get; set; } = 0;
    public int SalesCount { get; set; } = 0;
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? Tags { get; set; }
    public Guid CategoryId { get; set; }
    public Guid? BrandId { get; set; }

    public virtual Category Category { get; set; } = null!;
    public virtual Brand? Brand { get; set; }
    public virtual ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public virtual ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public virtual ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
