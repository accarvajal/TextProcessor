using System.Collections.Concurrent;
using System.Runtime.CompilerServices;
using System.Text;
using Microsoft.Extensions.Logging;
using TextProcessor.Application.Interfaces;
using TextProcessor.Application.Models;

namespace TextProcessor.Infrastructure.Services;

public class TextProcessingService : ITextProcessingService
{
    private readonly ILogger<TextProcessingService> _logger;
    private readonly Random _random;
    private readonly ConcurrentDictionary<string, string> _processedResults;

    public TextProcessingService(ILogger<TextProcessingService> logger)
    {
        _logger = logger;
        _random = new Random();
        _processedResults = new ConcurrentDictionary<string, string>();
    }

    public string ProcessText(string input, string jobId)
    {
        _logger.LogInformation("Processing text for job {JobId}: {Input}", jobId, input);
        var result = GenerateProcessedString(input);
        _processedResults.TryAdd(jobId, result);
        return result;
    }

    public async IAsyncEnumerable<char> StreamProcessedTextAsync(
        string jobId,
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        if (!_processedResults.TryGetValue(jobId, out var processedText))
        {
            yield break;
        }

        foreach (var character in processedText)
        {
            await Task.Delay(_random.Next(1000, 5000), cancellationToken);
            
            if (cancellationToken.IsCancellationRequested)
            {
                _logger.LogInformation("Streaming cancelled for job {JobId}", jobId);
                yield break;
            }

            yield return character;
        }

        _processedResults.TryRemove(jobId, out _);
        _logger.LogInformation("Completed streaming for job {JobId}", jobId);
    }

    public Task<ProcessingResult> ValidateInputAsync(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return Task.FromResult(new ProcessingResult 
            { 
                IsValid = false, 
                ErrorMessage = "Input cannot be empty" 
            });
        }

        return Task.FromResult(new ProcessingResult { IsValid = true });
    }

    public Task<int> GetProcessedTextLengthAsync(string jobId)
    {
        if (!_processedResults.TryGetValue(jobId, out var processedText))
        {
            return Task.FromResult(0);
        }
        return Task.FromResult(processedText.Length);
    }

    private static string GenerateProcessedString(string input)
    {
        // Group characters, count occurrences, and sort alphabetically
        var characterCounts = input
            .GroupBy(c => c)
            .OrderBy(g => g.Key)  // Sort alphabetically
            .Select(g => $"{g.Key}{g.Count()}") // Format as "character + count"
            .ToList();

        var base64String = Convert.ToBase64String(Encoding.UTF8.GetBytes(input));

        // Join character counts and Base64 with slash separator
        return string.Join("", characterCounts) + "/" + base64String;
    }
}
