import { TestBed } from '@angular/core/testing';
import { ErrorHandlingService } from './error-handling.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from '../core.module';

describe('ErrorHandlingService', () => {
  let service: ErrorHandlingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoreModule, BrowserAnimationsModule],
      providers: [ErrorHandlingService]
    });
    service = TestBed.inject(ErrorHandlingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});