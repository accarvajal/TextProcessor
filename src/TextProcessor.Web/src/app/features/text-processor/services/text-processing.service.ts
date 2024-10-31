import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProcessingResponse } from '@shared/models/processing-response.interface';

@Injectable({
  providedIn: 'root'
})
export class TextProcessingService {
  private baseUrl: string;
  private currentJobId: string | null = null;
  private eventSource: EventSource | null = null;

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') baseUrl: string
  ) {
    this.baseUrl = baseUrl;
  }

  processText(text: string): Observable<ProcessingResponse> {
    const result = new Subject<ProcessingResponse>();
    const payload = { text: text };
    const headers = new HttpHeaders().set('Accept', 'text/plain');

    this.http.post(`${this.baseUrl}/api/textprocessing/process`, payload, {
      headers: headers,
      responseType: 'text'
    }).subscribe({
      next: (jobId: string) => {
        this.currentJobId = jobId;
        this.setupEventSource(jobId, result);
      },
      error: (error) => {
        result.error(error);
      }
    });

    return result.asObservable();
  }

  private setupEventSource(jobId: string, result: Subject<ProcessingResponse>): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const url = `${this.baseUrl}/api/textprocessing/stream/${jobId}`;
    this.eventSource = new EventSource(url);
    
    this.eventSource.onmessage = (event) => {
      if (!event.data) {
        this.closeEventSource();
        result.complete();
        return;
      }

      result.next({
        jobId: jobId,
        processedText: event.data
      });
    };

    this.eventSource.onerror = (error) => {
      // Only complete if the connection is actually closed
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.closeEventSource();
        result.complete();
      } else {
        result.error(error);
      }
    };
  }

  private closeEventSource(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.currentJobId = null;
  }

  cancelProcessing(): Observable<void> {
    if (!this.currentJobId) {
      return new Observable(subscriber => subscriber.complete());
    }

    const jobId = this.currentJobId;
    return new Observable(subscriber => {
      this.http.post<void>(`${this.baseUrl}/api/textprocessing/cancel/${jobId}`, {})
        .subscribe({
          next: () => {
            this.closeEventSource();
            subscriber.next();
            subscriber.complete();
          },
          error: (error) => {
            subscriber.error(error);
          }
        });
    });
  }
}