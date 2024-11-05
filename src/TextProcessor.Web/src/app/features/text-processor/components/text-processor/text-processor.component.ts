import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TextProcessingService } from '../../services/text-processing.service';
import { Subject, takeUntil } from 'rxjs';
import { ProcessingResponse } from '@shared/models/processing-response.interface';

@Component({
  selector: 'app-text-processor',
  templateUrl: './text-processor.component.html',
  styleUrls: ['./text-processor.component.scss']
})
export class TextProcessorComponent implements OnDestroy {
  form!: FormGroup;
  processedText = '';
  isProcessing = false;
  error: string | null = null;
  progress = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private textProcessingService: TextProcessingService,
    private cd: ChangeDetectorRef
  ) {
    this.initializeForm();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCancel(): void {
    if (!this.isProcessing) {
      return;
    }

    this.textProcessingService.cancelProcessing()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isProcessing = false;
          this.form.enable();
          this.error = null;
        },
        error: (error) => {
          console.error('Cancel error:', error);
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isProcessing) {
      return;
    }

    const text = this.form.get('inputText')?.value;
    if (!text) {
      return;
    }

    this.startProcessing(text);
  }
  
  private initializeForm(): void {
    this.form = this.fb.group({
      inputText: [{ 
        value: '', 
        disabled: false 
      }, Validators.required]
    });
  }

  private startProcessing(text: string): void {
    this.isProcessing = true;
    this.error = null;
    this.processedText = '';
    this.progress = 0;
    this.form.disable();

    this.textProcessingService.processText(text)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ProcessingResponse) => {
          this.processedText += response.processedText;
          this.progress = response.progress;
          this.cd.detectChanges();
        },
        error: (err) => {
          this.error = err.error?.message || 'An error occurred while processing';
          this.isProcessing = false;
          this.progress = 0;
          this.form.enable();
          this.cd.detectChanges();
        },
        complete: () => {
          this.isProcessing = false;
          this.progress = 100;
          this.form.enable();
          this.cd.detectChanges();
        }
      });
  }
}