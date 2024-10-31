using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TextProcessor.Application.Interfaces;

public class StreamingResult : IActionResult
{
    private readonly ITextProcessingService _textProcessingService;
    private readonly string _jobId;
    private readonly CancellationToken _cancellationToken;

    public StreamingResult(
        ITextProcessingService textProcessingService,
        string jobId,
        CancellationToken cancellationToken)
    {
        _textProcessingService = textProcessingService;
        _jobId = jobId;
        _cancellationToken = cancellationToken;
    }

    public async Task ExecuteResultAsync(ActionContext context)
    {
        var response = context.HttpContext.Response;
        
        await foreach (var character in _textProcessingService
            .StreamProcessedTextAsync(_jobId, _cancellationToken))
        {
            var data = $"data: {character}\n\n";
            await response.WriteAsync(data, _cancellationToken);
            await response.Body.FlushAsync(_cancellationToken);
        }

        // Send an empty data message to signal completion
        await response.WriteAsync("data: \n\n", _cancellationToken);
        await response.Body.FlushAsync(_cancellationToken);
    }
}