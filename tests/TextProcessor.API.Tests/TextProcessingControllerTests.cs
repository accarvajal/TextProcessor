using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using TextProcessor.API.Controllers;
using TextProcessor.Application.Interfaces;
using TextProcessor.Application.Models;

namespace TextProcessor.API.Tests.Controllers;

public class TextProcessingControllerTests
{
    private readonly Mock<ITextProcessingService> _textProcessingServiceMock;
    private readonly Mock<IBackgroundJobManager> _jobManagerMock;
    private readonly Mock<ILogger<TextProcessingController>> _loggerMock;
    private readonly TextProcessingController _sut;

    public TextProcessingControllerTests()
    {
        _textProcessingServiceMock = new Mock<ITextProcessingService>();
        _jobManagerMock = new Mock<IBackgroundJobManager>();
        _loggerMock = new Mock<ILogger<TextProcessingController>>();
        _sut = new TextProcessingController(
            _textProcessingServiceMock.Object,
            _jobManagerMock.Object,
            _loggerMock.Object);

        // Set up HttpContext
        var httpContext = new DefaultHttpContext();
        _sut.ControllerContext = new ControllerContext()
        {
            HttpContext = httpContext
        };
    }

    [Fact]
    public async Task StartProcessing_WithValidInput_ReturnsOkWithJobId()
    {
        // Arrange
        var request = new ProcessingRequest { Text = "test" };
        var expectedJobId = Guid.NewGuid().ToString();

        _textProcessingServiceMock
            .Setup(x => x.ValidateInputAsync(request.Text))
            .ReturnsAsync(new ProcessingResult { IsValid = true });

        _jobManagerMock
            .Setup(x => x.StartJob(request.Text, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedJobId);

        // Act
        var result = await _sut.StartProcessing(request);

        // Assert
        var actionResult = result.Result as ObjectResult;
        actionResult.Should().NotBeNull();
        actionResult.Value.Should().Be(expectedJobId);
        actionResult.StatusCode.Should().Be(StatusCodes.Status200OK);
    }

    [Fact]
    public async Task StartProcessing_WithInvalidInput_ReturnsBadRequest()
    {
        // Arrange
        var request = new ProcessingRequest { Text = "" };
        var errorMessage = "Invalid input";

        _textProcessingServiceMock
            .Setup(x => x.ValidateInputAsync(request.Text))
            .ReturnsAsync(new ProcessingResult 
            { 
                IsValid = false, 
                ErrorMessage = errorMessage 
            });

        // Act
        var result = await _sut.StartProcessing(request);

        // Assert
        var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.Value.Should().Be(errorMessage);
    }
}