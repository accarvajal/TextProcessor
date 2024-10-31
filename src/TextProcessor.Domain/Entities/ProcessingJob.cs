namespace TextProcessor.Domain.Entities;

using TextProcessor.Domain.Enums;

public class ProcessingJob
{
    public Guid Id { get; private set; }
    public string InputText { get; private set; } = string.Empty;
    public string ProcessedText { get; private set; } = string.Empty;
    public JobStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    private ProcessingJob() { }

    public static ProcessingJob Create(string inputText)
    {
        return new ProcessingJob
        {
            Id = Guid.NewGuid(),
            InputText = inputText,
            Status = JobStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void Start()
    {
        Status = JobStatus.Processing;
    }

    public void Complete(string processedText)
    {
        ProcessedText = processedText;
        Status = JobStatus.Completed;
        CompletedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        Status = JobStatus.Cancelled;
        CompletedAt = DateTime.UtcNow;
    }

    public void Fail()
    {
        Status = JobStatus.Failed;
        CompletedAt = DateTime.UtcNow;
    }
}