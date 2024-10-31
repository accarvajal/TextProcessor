using Microsoft.AspNetCore.Mvc;
using TextProcessor.Application.Interfaces;
using TextProcessor.Application.Models;

namespace TextProcessor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TextProcessingController : ControllerBase
{
    private readonly ITextProcessingService _textProcessingService;
    private readonly IBackgroundJobManager _jobManager;
    private readonly ILogger<TextProcessingController> _logger;

    public TextProcessingController(
        ITextProcessingService textProcessingService,
        IBackgroundJobManager jobManager,
        ILogger<TextProcessingController> logger)
    {
        _textProcessingService = textProcessingService;
        _jobManager = jobManager;
        _logger = logger;
    }

    [HttpPost("process")]
    public async Task<ActionResult<string>> StartProcessing([FromBody] ProcessingRequest request)
    {
        try
        {
            var validationResult = await _textProcessingService.ValidateInputAsync(request.Text);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.ErrorMessage);
            }

            var jobId = await _jobManager.StartJob(request.Text, HttpContext.RequestAborted);
            return Ok(jobId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting text processing");
            return StatusCode(500, "An error occurred while processing the request");
        }
    }

    [HttpGet("stream/{jobId}")]
    public IActionResult StreamProcessing(string jobId)
    {
        if (!_jobManager.IsJobRunning(jobId))
        {
            return NotFound("Job not found or already completed");
        }

        try
        {
            Response.Headers.TryAdd("Content-Type", "text/event-stream");
            Response.Headers.TryAdd("Cache-Control", "no-cache");
            Response.Headers.TryAdd("Connection", "keep-alive");

            var cancellationToken = HttpContext.RequestAborted;
            return new StreamingResult(_textProcessingService, jobId, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting up stream for job {JobId}", jobId);
            return StatusCode(500, "Error initializing stream");
        }
    }

    [HttpPost("cancel/{jobId}")]
    public async Task<IActionResult> CancelProcessing(string jobId)
    {
        try
        {
            await _jobManager.CancelJob(jobId);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling job {JobId}", jobId);
            return StatusCode(500, "An error occurred while cancelling the job");
        }
    }
}