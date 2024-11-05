import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TextProcessorComponent } from './components/text-processor/text-processor.component';
import { environment } from 'src/environments/environment';
import { TextProcessingService } from './services/text-processing.service';
import { ErrorMessageComponent } from '@shared/components/error-message/error-message.component';
import { ProgressBarComponent } from '@shared/components/progress-bar/progress-bar.component';

@NgModule({
  declarations: [TextProcessorComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorMessageComponent,
    ProgressBarComponent
  ],
  providers: [
    { provide: 'BASE_URL', useValue: environment.apiUrl },
    TextProcessingService
  ],
  exports: [TextProcessorComponent]
})
export class TextProcessorModule { }