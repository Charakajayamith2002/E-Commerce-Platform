using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Brand : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? LogoPublicId { get; set; }
    public string? Website { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
    public int SortOrder { get; set; } = 0;

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
