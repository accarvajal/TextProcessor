using System.Text.Json.Serialization;

namespace TextProcessor.Application.Models;

public class ProcessingRequest
{
    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;
}