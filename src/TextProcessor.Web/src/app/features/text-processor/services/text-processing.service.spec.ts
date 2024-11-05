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

  it('should process text successfully', (done) => {
    const testText = 'test input';
    const jobId = '123';
    const totalLength = 100;

    // Mock EventSource
    const mockEventSource = {
      onmessage: null as any,
      onerror: null as any,
      onopen: null as any,
      readyState: 0,
      close: jasmine.createSpy('close'),
      CLOSED: 2,
      CONNECTING: 0,
      OPEN: 1,
      url: '',
      withCredentials: false,
      addEventListener: jasmine.createSpy('addEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent'),
      removeEventListener: jasmine.createSpy('removeEventListener')
    } as EventSource;

    spyOn(window, 'EventSource').and.returnValue(mockEventSource);

    service.processText(testText).subscribe({
      next: (response) => {
        expect(response).toBeTruthy();
        expect(response.processedText).toBe('processed text');
        expect(response.jobId).toBe(jobId);
        done();
      },
      error: (error) => {
        done.fail(error);
      }
    });

    // Handle the initial POST request
    const postReq = httpController.expectOne(`${testBaseUrl}/api/textprocessing/process`);
    expect(postReq.request.method).toEqual('POST');
    expect(postReq.request.body).toEqual({ text: testText });
    postReq.flush(jobId);

    // Handle the length request
    const lengthReq = httpController.expectOne(`${testBaseUrl}/api/textprocessing/length/${jobId}`);
    expect(lengthReq.request.method).toEqual('GET');
    lengthReq.flush({ totalLength });

    // Simulate EventSource message
    setTimeout(() => {
      if (mockEventSource.onmessage) {
        mockEventSource.onmessage(new MessageEvent('message', {
          data: 'processed text',
          lastEventId: '',
          origin: window.location.origin,
          ports: [],
          source: null,
          bubbles: false,
          cancelable: false,
          composed: false
        }));
      }
    });
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

  it('should cancel processing', (done) => {
    const jobId = '123';
    service['currentJobId'] = jobId;

    service.cancelProcessing().subscribe({
      next: () => {
        expect(service['currentJobId']).toBeNull();
        done();
      },
      error: (error) => {
        done.fail(error);
      }
    });

    const req = httpController.expectOne(`${testBaseUrl}/api/textprocessing/cancel/${jobId}`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});