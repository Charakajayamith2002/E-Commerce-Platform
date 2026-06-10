using System.Diagnostics;

namespace ECommerce.API.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            await _next(context);
        }
        finally
        {
            sw.Stop();
            var statusCode = context.Response.StatusCode;
            var method = context.Request.Method;
            var path = context.Request.Path;
            var elapsed = sw.ElapsedMilliseconds;

            if (statusCode >= 500)
                _logger.LogError("HTTP {Method} {Path} responded {StatusCode} in {Elapsed}ms", method, path, statusCode, elapsed);
            else if (statusCode >= 400)
                _logger.LogWarning("HTTP {Method} {Path} responded {StatusCode} in {Elapsed}ms", method, path, statusCode, elapsed);
            else
                _logger.LogInformation("HTTP {Method} {Path} responded {StatusCode} in {Elapsed}ms", method, path, statusCode, elapsed);
        }
    }
}
