using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace ECommerce.Application.Features.Auth.Commands;

public record RegisterCommand(RegisterDto Dto) : IRequest<Result<AuthResponseDto>>;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthResponseDto>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;

    public RegisterCommandHandler(
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        IEmailService emailService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _emailService = emailService;
    }

    public async Task<Result<AuthResponseDto>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        if (await _userManager.FindByEmailAsync(dto.Email) != null)
            return Result<AuthResponseDto>.Failure("Email is already registered.");

        var user = new ApplicationUser
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            UserName = dto.Email,
            PhoneNumber = dto.PhoneNumber
        };

        var createResult = await _userManager.CreateAsync(user, dto.Password);
        if (!createResult.Succeeded)
            return Result<AuthResponseDto>.Failure(createResult.Errors.Select(e => e.Description));

        await _userManager.AddToRoleAsync(user, "Customer");

        var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        user.EmailVerificationToken = emailToken;
        await _userManager.UpdateAsync(user);

        await _emailService.SendEmailVerificationAsync(user.Email, user.FirstName, emailToken);

        var (accessToken, refreshToken) = await _tokenService.GenerateTokensAsync(user);
        var roles = await _userManager.GetRolesAsync(user);

        var response = new AuthResponseDto(
            accessToken,
            refreshToken,
            DateTime.UtcNow.AddHours(1),
            new UserProfileDto(user.Id, user.Email!, user.FirstName, user.LastName,
                user.AvatarUrl, user.PhoneNumber, user.EmailConfirmed, roles.ToList())
        );

        return Result<AuthResponseDto>.Success(response, "Registration successful. Please verify your email.");
    }
}
