using TextProcessor.Application.Models;

namespace TextProcessor.Application.Interfaces;

public interface ITextProcessingService
{
    Task<int> GetProcessedTextLengthAsync(string jobId);
    string ProcessText(string input, string jobId);
    IAsyncEnumerable<char> StreamProcessedTextAsync(string jobId, CancellationToken cancellationToken);
    Task<ProcessingResult> ValidateInputAsync(string input);
}
