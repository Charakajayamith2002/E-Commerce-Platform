using ECommerce.Application.DTOs;
using ECommerce.Application.Features.Admin.Queries;
using ECommerce.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin,Manager")]
public class AdminController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminController(IMediator mediator, UserManager<ApplicationUser> userManager)
    {
        _mediator = mediator;
        _userManager = userManager;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var stats = await _mediator.Send(new GetDashboardStatsQuery());
        return Ok(new { succeeded = true, data = stats });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] UserFilterDto filter)
    {
        var query = _userManager.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            query = query.Where(u => u.Email!.Contains(filter.SearchTerm) ||
                u.FirstName.Contains(filter.SearchTerm) || u.LastName.Contains(filter.SearchTerm));

        if (filter.IsActive.HasValue) query = query.Where(u => u.IsActive == filter.IsActive.Value);
        if (filter.IsBlocked.HasValue) query = query.Where(u => u.IsBlocked == filter.IsBlocked.Value);

        var totalCount = await query.CountAsync();
        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((filter.PageIndex - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        var userDtos = new List<AdminUserDto>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            userDtos.Add(new AdminUserDto(user.Id, user.Email!, user.FirstName, user.LastName,
                user.AvatarUrl, user.IsActive, user.IsBlocked, user.EmailConfirmed,
                roles.ToList(), 0, 0, user.CreatedAt, null));
        }

        return Ok(new { succeeded = true, data = userDtos, totalCount });
    }

    [HttpPatch("users/{userId:guid}/block")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> BlockUser(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return NotFound();
        user.IsBlocked = !user.IsBlocked;
        await _userManager.UpdateAsync(user);
        return Ok(new { succeeded = true, message = user.IsBlocked ? "User blocked." : "User unblocked." });
    }

    [HttpDelete("users/{userId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return NotFound();
        await _userManager.DeleteAsync(user);
        return Ok(new { succeeded = true, message = "User deleted." });
    }

    [HttpPatch("users/{userId:guid}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ChangeUserRole(Guid userId, [FromBody] ChangeRoleDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return NotFound();

        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);
        await _userManager.AddToRoleAsync(user, dto.Role);

        return Ok(new { succeeded = true, message = $"User role changed to {dto.Role}." });
    }
}

public record ChangeRoleDto(string Role);
