using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;
using TextProcessor.Application.Interfaces;

namespace TextProcessor.Infrastructure.Services;

public class BackgroundJobManager : IBackgroundJobManager
{
    private readonly ConcurrentDictionary<string, CancellationTokenSource> _jobs;
    private readonly ITextProcessingService _textProcessingService;
    private readonly ILogger<BackgroundJobManager> _logger;

    public BackgroundJobManager(
        ITextProcessingService textProcessingService,
        ILogger<BackgroundJobManager> logger)
    {
        _jobs = new ConcurrentDictionary<string, CancellationTokenSource>();
        _textProcessingService = textProcessingService;
        _logger = logger;
    }

    public async Task<string> StartJob(string input, CancellationToken cancellationToken)
    {
        var jobId = Guid.NewGuid().ToString();
        var jobCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        
        if (!_jobs.TryAdd(jobId, jobCts))
        {
            throw new InvalidOperationException("Failed to start job");
        }

        try
        {
            _logger.LogInformation("Starting job {JobId} for input: {Input}", jobId, input);
            _textProcessingService.ProcessText(input, jobId);
            
            return jobId;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting job {JobId}", jobId);
            await CancelJob(jobId);
            throw;
        }
    }

    public async Task CancelJob(string jobId)
    {
        if (_jobs.TryRemove(jobId, out var cts))
        {
            try
            {
                await Task.Run(() => cts.Cancel());
                cts.Dispose();
                _logger.LogInformation("Job {JobId} cancelled successfully", jobId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling job {JobId}", jobId);
                throw;
            }
        }
    }

    public bool IsJobRunning(string jobId)
    {
        return _jobs.ContainsKey(jobId);
    }
}