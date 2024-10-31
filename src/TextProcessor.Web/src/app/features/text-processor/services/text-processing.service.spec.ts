import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TextProcessingService } from './text-processing.service';
import { provideHttpClient } from '@angular/common/http';

describe('TextProcessingService', () => {
  let service: TextProcessingService;
  let httpController: HttpTestingController;
  const testBaseUrl = 'http://localhost:5277';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TextProcessingService,
        { provide: 'BASE_URL', useValue: testBaseUrl },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(TextProcessingService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('should process text successfully', () => {
    const testText = 'test input';
    const jobId = '123';

    service.processText(testText).subscribe();

    const req = httpController.expectOne(`${testBaseUrl}/api/textprocessing/process`);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ text: testText });
    expect(req.request.headers.get('Accept')).toBe('text/plain');
    req.flush(jobId);
  });

  it('should handle processing error', () => {
    const testText = 'test input';
    const errorResponse = {
      status: 400,
      statusText: 'Bad Request'
    };

    service.processText(testText).subscribe({
      next: () => fail('Should have failed with the error'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
      }
    });

    const req = httpController.expectOne(`${testBaseUrl}/api/textprocessing/process`);
    req.error(new ErrorEvent('Network error'), errorResponse);
  });

  it('should cancel processing', () => {
    const jobId = '123';
    service['currentJobId'] = jobId;

    service.cancelProcessing().subscribe(response => {
      expect(response).toBeUndefined();
    });

    const req = httpController.expectOne(`${testBaseUrl}/api/textprocessing/cancel/${jobId}`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });
});