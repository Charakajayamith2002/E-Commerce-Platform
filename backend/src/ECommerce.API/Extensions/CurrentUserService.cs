using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ECommerce.Application.Common.Interfaces;

namespace ECommerce.API.Extensions;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            // .NET 8 JsonWebTokenHandler doesn't map inbound claims — check all common claim names
            var claim = user?.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? user?.FindFirstValue(JwtRegisteredClaimNames.Sub)
                     ?? user?.FindFirstValue("nameid");
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }

    public string? UserEmail =>
        _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email)
        ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue(JwtRegisteredClaimNames.Email);

    public bool IsAuthenticated =>
        _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

    public bool IsInRole(string role) =>
        _httpContextAccessor.HttpContext?.User?.IsInRole(role) ?? false;

    public IEnumerable<string> Roles =>
        _httpContextAccessor.HttpContext?.User?.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value) ?? Enumerable.Empty<string>();
}
