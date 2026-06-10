using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Review : AuditableEntity
{
    public Guid ProductId { get; set; }
    public Guid UserId { get; set; }
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string Comment { get; set; } = string.Empty;
    public bool IsVerifiedPurchase { get; set; } = false;
    public bool IsApproved { get; set; } = true;
    public int HelpfulCount { get; set; } = 0;
    public string[]? Images { get; set; }

    public virtual Product Product { get; set; } = null!;
    public virtual ApplicationUser User { get; set; } = null!;
}
