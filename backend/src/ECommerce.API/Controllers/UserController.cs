using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ICurrentUserService _currentUser;
    private readonly ICloudinaryService _cloudinary;

    public UserController(
        UserManager<ApplicationUser> userManager,
        ICurrentUserService currentUser,
        ICloudinaryService cloudinary)
    {
        _userManager = userManager;
        _currentUser = currentUser;
        _cloudinary = cloudinary;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var user = await _userManager.FindByIdAsync(_currentUser.UserId!.Value.ToString());
        if (user == null) return NotFound();

        var roles = await _userManager.GetRolesAsync(user);
        var profile = new UserProfileDto(user.Id, user.Email!, user.FirstName, user.LastName,
            user.AvatarUrl, user.PhoneNumber, user.EmailConfirmed, roles.ToList());

        return Ok(new { succeeded = true, data = profile });
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var user = await _userManager.FindByIdAsync(_currentUser.UserId!.Value.ToString());
        if (user == null) return NotFound();

        if (dto.FirstName != null) user.FirstName = dto.FirstName;
        if (dto.LastName != null) user.LastName = dto.LastName;
        if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber;
        user.UpdatedAt = DateTime.UtcNow;

        await _userManager.UpdateAsync(user);
        return Ok(new { succeeded = true, message = "Profile updated." });
    }

    [HttpPost("avatar")]
    public async Task<IActionResult> UpdateAvatar([FromForm] IFormFile avatar)
    {
        var user = await _userManager.FindByIdAsync(_currentUser.UserId!.Value.ToString());
        if (user == null) return NotFound();

        if (user.AvatarPublicId != null)
            await _cloudinary.DeleteImageAsync(user.AvatarPublicId);

        var (url, publicId) = await _cloudinary.UploadImageAsync(avatar, "avatars");
        user.AvatarUrl = url;
        user.AvatarPublicId = publicId;
        user.UpdatedAt = DateTime.UtcNow;

        await _userManager.UpdateAsync(user);
        return Ok(new { succeeded = true, data = new { avatarUrl = url } });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var user = await _userManager.FindByIdAsync(_currentUser.UserId!.Value.ToString());
        if (user == null) return NotFound();

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded)
            return BadRequest(new { succeeded = false, errors = result.Errors.Select(e => e.Description) });

        user.RefreshToken = null;
        await _userManager.UpdateAsync(user);

        return Ok(new { succeeded = true, message = "Password changed successfully." });
    }
}

public record UpdateProfileDto(string? FirstName, string? LastName, string? PhoneNumber, DateTime? DateOfBirth, string? Gender);
