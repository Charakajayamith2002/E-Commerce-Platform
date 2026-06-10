using ECommerce.Application.Features.Payments.Commands;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Persistence.Context;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IConfiguration _configuration;
    private readonly ApplicationDbContext _context;

    public PaymentsController(IMediator mediator, IConfiguration configuration, ApplicationDbContext context)
    {
        _mediator = mediator;
        _configuration = configuration;
        _context = context;
    }

    [HttpPost("create-intent")]
    [Authorize]
    public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentRequest request)
    {
        var result = await _mediator.Send(new CreatePaymentIntentCommand(request.OrderId));
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> StripeWebhook()
    {
        var payload = await new StreamReader(Request.Body).ReadToEndAsync();
        var signature = Request.Headers["Stripe-Signature"].ToString();
        var webhookSecret = _configuration["Stripe:WebhookSecret"]!;

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(payload, signature, webhookSecret);

            switch (stripeEvent.Type)
            {
                case "payment_intent.succeeded":
                    await HandlePaymentSucceeded(stripeEvent.Data.Object as PaymentIntent);
                    break;
                case "payment_intent.payment_failed":
                    await HandlePaymentFailed(stripeEvent.Data.Object as PaymentIntent);
                    break;
            }

            return Ok();
        }
        catch (StripeException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    private async Task HandlePaymentSucceeded(PaymentIntent? intent)
    {
        if (intent == null) return;

        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.StripePaymentIntentId == intent.Id);

        if (order == null) return;

        order.PaymentStatus = PaymentStatus.Succeeded;
        order.Status = OrderStatus.Confirmed;
        order.UpdatedAt = DateTime.UtcNow;

        var payment = await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == order.Id);
        if (payment != null)
        {
            payment.Status = PaymentStatus.Succeeded;
            payment.PaidAt = DateTime.UtcNow;
            payment.StripeChargeId = intent.LatestChargeId;
        }
        else
        {
            _context.Payments.Add(new Payment
            {
                OrderId = order.Id,
                StripePaymentIntentId = intent.Id,
                Amount = intent.Amount / 100m,
                Currency = intent.Currency.ToUpper(),
                Method = ECommerce.Domain.Enums.PaymentMethod.Stripe,
                Status = PaymentStatus.Succeeded,
                PaidAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
    }

    private async Task HandlePaymentFailed(PaymentIntent? intent)
    {
        if (intent == null) return;

        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.StripePaymentIntentId == intent.Id);

        if (order == null) return;

        order.PaymentStatus = PaymentStatus.Failed;
        order.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }
}

public record CreatePaymentIntentRequest(Guid OrderId);
