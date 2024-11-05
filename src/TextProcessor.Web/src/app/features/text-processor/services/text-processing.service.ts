import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, from, throwError } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { ProcessingResponse } from '@shared/models/processing-response.interface';

@Injectable({
  providedIn: 'root'
})
export class TextProcessingService {
  private baseUrl: string;
  private currentJobId: string | null = null;
  private eventSource: EventSource | null = null;
  private totalChars: number = 0;
  private processedChars: number = 0;

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') baseUrl: string
  ) {
    this.baseUrl = baseUrl;
  }

  processText(text: string): Observable<ProcessingResponse> {
    const payload = { text };
    const headers = new HttpHeaders().set('Accept', 'text/plain');

    return this.http.post(`${this.baseUrl}/api/textprocessing/process`, payload, {
      headers,
      responseType: 'text',
      withCredentials: true
    }).pipe(
      tap((jobId: string) => {
        this.currentJobId = jobId;
        this.processedChars = 0; // Reset counter
      }),
      switchMap((jobId: string) => {
        return this.http.get<{totalLength: number}>(`${this.baseUrl}/api/textprocessing/length/${jobId}`).pipe(
          tap(response => {
            this.totalChars = response.totalLength;
          }),
          switchMap(() => this.createEventSourceObservable(jobId))
        );
      }),
      catchError(error => {
        this.closeEventSource();
        return throwError(() => error);
      })
    );
  }

  private createEventSourceObservable(jobId: string): Observable<ProcessingResponse> {
    return new Observable<ProcessingResponse>(observer => {
      if (this.eventSource) {
        this.eventSource.close();
      }
  
      const username = 'admin';
      const password = 'password';
      const credentials = btoa(`${username}:${password}`);
      const url = `${this.baseUrl}/api/textprocessing/stream/${jobId}?auth=${credentials}`;
      this.eventSource = new EventSource(url);
  
      let isCompleting = false;

      this.eventSource.onmessage = (event) => {
        if (!event.data) {
          if (!isCompleting) {
            isCompleting = true;
            observer.next({
              jobId,
              processedText: '',
              progress: 100
            });
          }

          this.closeEventSource();
          observer.complete();
          return;
        }
  
        this.processedChars += event.data.length;
        // Cap progress at 95% until completion
        const progress = Math.min(Math.round((this.processedChars / this.totalChars) * 95), 95);

        observer.next({
          jobId,
          processedText: event.data,
          progress
        });
      };
  
      this.eventSource.onerror = (error) => {
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          this.closeEventSource();
          observer.complete();
        } else {
          observer.error(error);
        }
      };
  
      return () => {
        this.closeEventSource();
      };
    });
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
      return from(Promise.resolve());
    }

    const jobId = this.currentJobId;
    return this.http.post<void>(`${this.baseUrl}/api/textprocessing/cancel/${jobId}`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.closeEventSource();
      }),
      catchError(error => {
        this.closeEventSource();
        return throwError(() => error);
      })
    );
  }
}