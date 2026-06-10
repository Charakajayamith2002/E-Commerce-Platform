using ECommerce.Application.DTOs;
using ECommerce.Application.Features.Cart.Commands;
using ECommerce.Application.Features.Cart.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly IMediator _mediator;

    public CartController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var result = await _mediator.Send(new GetCartQuery());
        return Ok(result);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
    {
        var result = await _mediator.Send(new AddToCartCommand(dto));
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("items/{itemId:guid}")]
    public async Task<IActionResult> UpdateCartItem(Guid itemId, [FromBody] UpdateCartItemDto dto)
    {
        var result = await _mediator.Send(new UpdateCartItemCommand(itemId, dto.Quantity));
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("items/{itemId:guid}")]
    public async Task<IActionResult> RemoveCartItem(Guid itemId)
    {
        var result = await _mediator.Send(new RemoveCartItemCommand(itemId));
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var result = await _mediator.Send(new ClearCartCommand());
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("coupon")]
    public async Task<IActionResult> ApplyCoupon([FromBody] ApplyCouponDto dto)
    {
        var result = await _mediator.Send(new ValidateCouponQuery(dto.CouponCode));
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }
}
