using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using TextProcessor.Application.Interfaces;
using TextProcessor.Infrastructure.Services;

namespace TextProcessor.Application.Tests.Services;

public class TextProcessingServiceTests
{
    private readonly ITextProcessingService _sut;
    private readonly Mock<ILogger<TextProcessingService>> _loggerMock;

    public TextProcessingServiceTests()
    {
        _loggerMock = new Mock<ILogger<TextProcessingService>>();
        _sut = new TextProcessingService(_loggerMock.Object);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public async Task ValidateInput_WithInvalidInput_ReturnsInvalidResult(string input)
    {
        // Act
        var result = await _sut.ValidateInputAsync(input);

        // Assert
        result.IsValid.Should().BeFalse();
        result.ErrorMessage.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task ValidateInput_WithValidInput_ReturnsValidResult()
    {
        // Arrange
        var input = "Hello";

        // Act
        var result = await _sut.ValidateInputAsync(input);

        // Assert
        result.IsValid.Should().BeTrue();
        result.ErrorMessage.Should().BeNull();
    }
}