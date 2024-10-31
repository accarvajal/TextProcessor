# Text Processor

A real-time text processing application built with Angular and .NET Core, featuring server-sent events (SSE) for character-by-character streaming.

## Features

- Real-time character streaming using SSE
- Text processing with character grouping and Base64 encoding
- Cancellable processing operations
- Input validation
- Progress indication
- Error handling

## Tech Stack

### Frontend
- Angular 17
- TypeScript
- RxJS
- Bootstrap 5

### Backend
- .NET Core 8
- C#
- Server-Sent Events (SSE)

## Prerequisites

- Node.js (v18 or later)
- .NET Core SDK 8.0
- Angular CLI

## Solution Structure

The backend solution follows Clean Architecture principles with these projects:

### TextProcessor.API
- Main API project with ASP.NET Core 8
- Dependencies:
  - Microsoft.AspNetCore.OpenApi (8.0.10)
  - Serilog (4.1.0)
  - Serilog.AspNetCore (8.0.3)
  - Serilog.Sinks.File (6.0.0)
  - Swashbuckle.AspNetCore (6.6.2)
- References:
  - TextProcessor.Application
  - TextProcessor.Infrastructure

### TextProcessor.Infrastructure
- Infrastructure concerns implementation
- Dependencies:
  - Microsoft.AspNetCore.Http.Abstractions (2.2.0)
  - Microsoft.AspNetCore.Mvc.Abstractions (2.2.0)
  - Microsoft.Extensions.Logging.Abstractions (8.0.2)
- References:
  - TextProcessor.Application

### TextProcessor.Application
- Application business logic and CQRS implementation
- Dependencies:
  - Microsoft.Extensions.DependencyInjection.Abstractions (8.0.0)
- References:
  - TextProcessor.Domain

### TextProcessor.Domain
- Core domain entities and business rules
- No external dependencies

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/text-processor.git
cd text-processor
```
2. Navigate to the frontend project directory
```bash
cd TextProcessor.Web
```
3. Install frontend dependencies:
```bash
npm install
```
4. Start the Angular development server:
```bash
ng serve
```
5. Install the required NuGet packages for the backend:

```bash
cd TextProcessor.Domain
dotnet restore
```

```bash
cd TextProcessor.Application
dotnet restore
```

```bash
cd TextProcessor.Infrastructure
dotnet restore
```

```bash
cd TextProcessor.API
dotnet restore
```
6. Navigate to the backend project directory
```bash
cd TextProcessor.API
```
7. Start the .NET Core development server:
```bash
dotnet run
```
8. Open your browser and navigate to `http://localhost:4200`

## Architecture

The application uses a streaming architecture with:

1. Initial text processing request
2. Job creation and management
3. Server-sent events for streaming results
4. Real-time UI updates
5. Feature-Driven Architecture for the frontend
6. Clean Architecture for the backend

Key components:

- TextProcessingService: Handles communication with the backend
- TextProcessorComponent: Manages the UI and user interactions
- StreamingResult: Implements server-side streaming

## Development

### Running Tests

Frontend tests:
```bash
cd src/TextProcessor.Web
ng test
```

Backend tests:
```bash
dotnet test tests/TextProcessor.API.Tests
dotnet test tests/TextProcessor.Application.Tests
dotnet test tests/TextProcessor.Infrastructure.Tests
```