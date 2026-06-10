using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Cart : BaseEntity
{
    public Guid? UserId { get; set; }
    public string? SessionId { get; set; }
    public decimal TotalAmount { get; set; } = 0;
    public int TotalItems { get; set; } = 0;
    public DateTime? ExpiresAt { get; set; }

    public virtual ApplicationUser? User { get; set; }
    public virtual ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}
