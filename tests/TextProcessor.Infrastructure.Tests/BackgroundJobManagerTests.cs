using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using TextProcessor.Application.Interfaces;
using TextProcessor.Infrastructure.Services;
using Xunit;

namespace TextProcessor.Infrastructure.Tests.Services;

public class BackgroundJobManagerTests
{
    private readonly Mock<ITextProcessingService> _textProcessingServiceMock;
    private readonly Mock<ILogger<BackgroundJobManager>> _loggerMock;
    private readonly BackgroundJobManager _sut;

    public BackgroundJobManagerTests()
    {
        _textProcessingServiceMock = new Mock<ITextProcessingService>();
        _loggerMock = new Mock<ILogger<BackgroundJobManager>>();
        _sut = new BackgroundJobManager(_textProcessingServiceMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task StartJob_WithValidInput_ReturnsJobId()
    {
        // Arrange
        var input = "test";
        var chars = new[] { 't', 'e', 's', 't' };
        var asyncEnumerable = chars.ToAsyncEnumerable();
        
        _textProcessingServiceMock
            .Setup(x => x.ProcessText(input, It.IsAny<string>()))
            .Returns("processed result");

        // Act
        var jobId = await _sut.StartJob(input, CancellationToken.None);

        // Assert
        jobId.Should().NotBeNullOrEmpty();
        _sut.IsJobRunning(jobId).Should().BeTrue();
    }

    [Fact]
    public async Task CancelJob_WithRunningJob_CancelsSuccessfully()
    {
        // Arrange
        var input = "test";
        
        _textProcessingServiceMock
            .Setup(x => x.ProcessText(input, It.IsAny<string>()))
            .Returns("processed result");

        var jobId = await _sut.StartJob(input, CancellationToken.None);

        // Act
        await _sut.CancelJob(jobId);

        // Assert
        _sut.IsJobRunning(jobId).Should().BeFalse();
    }
}