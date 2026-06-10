using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace ECommerce.Application.Features.Auth.Commands;

public record ResetPasswordCommand(ResetPasswordDto Dto) : IRequest<Result>;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public ResetPasswordCommandHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;
        var user = await _userManager.FindByEmailAsync(dto.Email);

        if (user == null)
            return Result.Failure("Invalid request.");

        var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
        if (!result.Succeeded)
            return Result.Failure(result.Errors.Select(e => e.Description));

        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;
        user.RefreshToken = null;
        user.UpdatedAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return Result.Success("Password has been reset successfully.");
    }
}
