using ECommerce.Application.DTOs;
using ECommerce.Application.Features.Orders.Commands;
using ECommerce.Application.Features.Orders.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _mediator.Send(new GetUserOrdersQuery(page, pageSize));
        return Ok(new { succeeded = true, data = result });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        var result = await _mediator.Send(new GetOrderByIdQuery(id));
        if (!result.Succeeded) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        var result = await _mediator.Send(new CreateOrderCommand(dto));
        if (!result.Succeeded) return BadRequest(result);
        return CreatedAtAction(nameof(GetOrder), new { id = result.Data }, result);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusDto dto)
    {
        var result = await _mediator.Send(new UpdateOrderStatusCommand(id, dto));
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("all")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> GetAllOrders(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15)
    {
        var result = await _mediator.Send(new GetAllOrdersQuery(search, status, page, pageSize));
        return Ok(new { succeeded = true, data = result });
    }
}
