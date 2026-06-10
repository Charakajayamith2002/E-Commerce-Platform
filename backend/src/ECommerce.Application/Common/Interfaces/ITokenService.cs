using ECommerce.Domain.Entities;

namespace ECommerce.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(ApplicationUser user, IList<string> roles);
    string GenerateRefreshToken();
    Guid? ValidateRefreshToken(string refreshToken);
    Task<(string accessToken, string refreshToken)> GenerateTokensAsync(ApplicationUser user);
}
