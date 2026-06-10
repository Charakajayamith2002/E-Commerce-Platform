using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class ProductVariant : BaseEntity
{
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Value { get; set; }
    public string? SKU { get; set; }
    public decimal? PriceModifier { get; set; }
    public int StockQuantity { get; set; } = 0;
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; } = 0;

    public virtual Product Product { get; set; } = null!;
}
