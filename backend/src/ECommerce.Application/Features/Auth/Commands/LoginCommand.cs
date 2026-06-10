using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace ECommerce.Application.Features.Auth.Commands;

public record LoginCommand(LoginDto Dto) : IRequest<Result<AuthResponseDto>>;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthResponseDto>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;

    public LoginCommandHandler(UserManager<ApplicationUser> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<Result<AuthResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            return Result<AuthResponseDto>.Failure("Invalid email or password.");

        if (user.IsBlocked)
            return Result<AuthResponseDto>.Failure("Your account has been blocked. Please contact support.");

        var (accessToken, refreshToken) = await _tokenService.GenerateTokensAsync(user);
        var roles = await _userManager.GetRolesAsync(user);

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        user.UpdatedAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        var response = new AuthResponseDto(
            accessToken,
            refreshToken,
            DateTime.UtcNow.AddHours(1),
            new UserProfileDto(user.Id, user.Email!, user.FirstName, user.LastName,
                user.AvatarUrl, user.PhoneNumber, user.EmailConfirmed, roles.ToList())
        );

        return Result<AuthResponseDto>.Success(response);
    }
}
