using ECommerce.Application.Common.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace ECommerce.Infrastructure.Services.Email;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration) => _configuration = configuration;

    private async Task SendAsync(string to, string subject, string htmlBody)
    {
        var settings = _configuration.GetSection("EmailSettings");
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(settings["FromName"], settings["FromEmail"]));
        message.To.Add(new MailboxAddress("", to));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };
        message.Body = bodyBuilder.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(settings["SmtpHost"], int.Parse(settings["SmtpPort"] ?? "587"), SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(settings["SmtpUsername"], settings["SmtpPassword"]);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    public async Task SendEmailAsync(string to, string subject, string htmlBody) =>
        await SendAsync(to, subject, htmlBody);

    public async Task SendWelcomeEmailAsync(string to, string name) =>
        await SendAsync(to, "Welcome to ECommerce Store!", GetWelcomeTemplate(name));

    public async Task SendEmailVerificationAsync(string to, string name, string token)
    {
        var clientUrl = _configuration["ClientUrl"];
        var verifyLink = $"{clientUrl}/verify-email?email={Uri.EscapeDataString(to)}&token={Uri.EscapeDataString(token)}";
        await SendAsync(to, "Verify Your Email", GetVerificationTemplate(name, verifyLink));
    }

    public async Task SendPasswordResetAsync(string to, string name, string token)
    {
        var clientUrl = _configuration["ClientUrl"];
        var resetLink = $"{clientUrl}/reset-password?email={Uri.EscapeDataString(to)}&token={Uri.EscapeDataString(token)}";
        await SendAsync(to, "Reset Your Password", GetPasswordResetTemplate(name, resetLink));
    }

    public async Task SendOrderConfirmationAsync(string to, string name, string orderNumber, decimal total) =>
        await SendAsync(to, $"Order Confirmed - #{orderNumber}", GetOrderConfirmationTemplate(name, orderNumber, total));

    public async Task SendOrderStatusUpdateAsync(string to, string name, string orderNumber, string status) =>
        await SendAsync(to, $"Order Update - #{orderNumber}", GetOrderStatusTemplate(name, orderNumber, status));

    public async Task SendShippingNotificationAsync(string to, string name, string orderNumber, string trackingNumber) =>
        await SendAsync(to, $"Your Order #{orderNumber} Has Shipped!", GetShippingTemplate(name, orderNumber, trackingNumber));

    private static string GetWelcomeTemplate(string name) => $@"
        <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>
            <h1 style='color:#6366f1'>Welcome to ECommerce Store!</h1>
            <p>Hi {name},</p>
            <p>Thank you for joining us! Explore thousands of products at amazing prices.</p>
            <a href='#' style='background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none'>Shop Now</a>
        </div>";

    private static string GetVerificationTemplate(string name, string link) => $@"
        <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>
            <h1 style='color:#6366f1'>Verify Your Email</h1>
            <p>Hi {name},</p>
            <p>Please click the button below to verify your email address.</p>
            <a href='{link}' style='background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none'>Verify Email</a>
            <p style='color:#666;font-size:12px;margin-top:20px'>This link expires in 24 hours.</p>
        </div>";

    private static string GetPasswordResetTemplate(string name, string link) => $@"
        <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>
            <h1 style='color:#6366f1'>Reset Your Password</h1>
            <p>Hi {name},</p>
            <p>Click the button below to reset your password. This link expires in 1 hour.</p>
            <a href='{link}' style='background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none'>Reset Password</a>
            <p style='color:#666;font-size:12px;margin-top:20px'>If you didn't request this, please ignore this email.</p>
        </div>";

    private static string GetOrderConfirmationTemplate(string name, string orderNumber, decimal total) => $@"
        <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>
            <h1 style='color:#6366f1'>Order Confirmed!</h1>
            <p>Hi {name},</p>
            <p>Your order <strong>#{orderNumber}</strong> has been placed successfully.</p>
            <p>Total Amount: <strong>${total:F2}</strong></p>
            <p>We'll send you updates as your order progresses.</p>
        </div>";

    private static string GetOrderStatusTemplate(string name, string orderNumber, string status) => $@"
        <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>
            <h1 style='color:#6366f1'>Order Update</h1>
            <p>Hi {name},</p>
            <p>Your order <strong>#{orderNumber}</strong> status has been updated to: <strong>{status}</strong></p>
        </div>";

    private static string GetShippingTemplate(string name, string orderNumber, string trackingNumber) => $@"
        <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>
            <h1 style='color:#6366f1'>Your Order Has Shipped!</h1>
            <p>Hi {name},</p>
            <p>Your order <strong>#{orderNumber}</strong> is on its way.</p>
            <p>Tracking Number: <strong>{trackingNumber}</strong></p>
        </div>";
}
