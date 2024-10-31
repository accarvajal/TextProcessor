import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TextProcessorComponent } from './text-processor.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TextProcessingService } from '../../services/text-processing.service';
import { errorInterceptor } from 'src/app/core/interceptors/error.interceptor';
import { loadingInterceptor } from 'src/app/core/interceptors/loading.interceptor';
import { ReactiveFormsModule } from '@angular/forms';
import { TextProcessorModule } from '../../text-processor.module';
import { By } from '@angular/platform-browser';

describe('TextProcessorComponent', () => {
  let component: TextProcessorComponent;
  let fixture: ComponentFixture<TextProcessorComponent>;
  let service: TextProcessingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TextProcessorModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        TextProcessingService,
        provideHttpClient(
          withInterceptors([
            errorInterceptor,
            loadingInterceptor
          ])
        )
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TextProcessorComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(TextProcessingService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty input text', () => {
    expect(component.form.get('inputText')?.value).toBe('');
    expect(component.form.get('inputText')?.valid).toBeFalse();
  });

  it('should disable submit when form is invalid', () => {
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBeTrue();
  });

  it('should enable submit when form is valid', () => {
    component.form.get('inputText')?.setValue('test text');
    fixture.detectChanges();
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBeFalse();
  });

  it('should disable form during processing', () => {
    // Arrange
    component.form.get('inputText')?.setValue('test text');
    fixture.detectChanges();
  
    // Act
    component.onSubmit();
    fixture.detectChanges();
  
    // Assert
    expect(component.form.disabled).toBeTrue();
    expect(component.isProcessing).toBeTrue();
  });

  it('should show error message when processing fails', () => {
    const errorMessage = 'Test error';
    component.error = errorMessage;
    fixture.detectChanges();
    const errorElement = fixture.debugElement.query(By.css('.error-alert'));
    expect(errorElement.nativeElement.textContent).toContain(errorMessage);
  });
});