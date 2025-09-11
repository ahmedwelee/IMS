import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ErrorDetails } from './error-details';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorSubject = new BehaviorSubject<ErrorDetails | null>(null);
  public error$ = this.errorSubject.asObservable();

  showError(error: ErrorDetails): void {
    this.errorSubject.next(error);
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  getCurrentError(): ErrorDetails | null {
    return this.errorSubject.value;
  }
}
