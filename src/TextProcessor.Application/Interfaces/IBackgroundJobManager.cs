namespace TextProcessor.Application.Interfaces;

public interface IBackgroundJobManager
{
    Task<string> StartJob(string input, CancellationToken cancellationToken);
    Task CancelJob(string jobId);
    bool IsJobRunning(string jobId);
}