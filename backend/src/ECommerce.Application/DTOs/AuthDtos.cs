using System.ComponentModel.DataAnnotations;

namespace ECommerce.Application.DTOs;

public record RegisterDto(
    [Required] string FirstName,
    [Required] string LastName,
    [Required][EmailAddress] string Email,
    [Required][MinLength(8)] string Password,
    string? PhoneNumber = null
);

public record LoginDto(
    [Required][EmailAddress] string Email,
    [Required] string Password,
    bool RememberMe = false
);

public record ForgotPasswordDto([Required][EmailAddress] string Email);

public record ResetPasswordDto(
    [Required] string Email,
    [Required] string Token,
    [Required][MinLength(8)] string NewPassword
);

public record ChangePasswordDto(
    [Required] string CurrentPassword,
    [Required][MinLength(8)] string NewPassword
);

public record VerifyEmailDto(
    [Required] string Email,
    [Required] string Token
);

public record RefreshTokenDto([Required] string RefreshToken);

public record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserProfileDto User
);

public record UserProfileDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? AvatarUrl,
    string? PhoneNumber,
    bool EmailConfirmed,
    List<string> Roles
);

public record GoogleAuthDto([Required] string IdToken);
