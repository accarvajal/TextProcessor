using Microsoft.AspNetCore.Http;
using System.Text;

namespace TextProcessor.Infrastructure.Middleware
{
    public class BasicAuthMiddleware
    {
        private readonly RequestDelegate _next;
        private const string AuthHeader = "Authorization";

        public BasicAuthMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Skip authentication for SSE endpoints
            if (context.Request.Path.StartsWithSegments("/api/textprocessing/stream"))
            {
                await _next(context);
                return;
            }

            if (!context.Request.Headers.ContainsKey(AuthHeader))
            {
                context.Response.StatusCode = 401;
                return;
            }

            var header = context.Request.Headers[AuthHeader].ToString();
            var credentials = Encoding.UTF8.GetString(
                Convert.FromBase64String(header.Replace("Basic ", ""))).Split(':');

            if (!IsValidUser(credentials[0], credentials[1]))
            {
                context.Response.StatusCode = 401;
                return;
            }

            await _next(context);
        }

        private bool IsValidUser(string username, string password)
        {
            // Replace with actual authentication logic
            return username == "admin" && password == "password";
        }
    }
} 
