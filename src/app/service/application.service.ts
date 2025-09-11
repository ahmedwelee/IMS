import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApplicationRequest } from './application-request';
import { ApplicationResponse } from './application-response';
import {ErrorService} from "./error.service";
import {ErrorDetails} from "./error-details";

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  readonly apiUrl = 'http://localhost:8088';
  private readonly endpoint = `${this.apiUrl}/applications`;

  constructor(
    private http: HttpClient,
    private errorService: ErrorService) {
  }

  // GET all applications
  getAllApplications(): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(this.endpoint).pipe(
      catchError(error => this.handleError('Failed to load applications', error))
    );
  }

  // GET application by ID
  getApplicationById(id: number): Observable<ApplicationResponse> {
    return this.http.get<ApplicationResponse>(`${this.endpoint}/${id}`).pipe(
      catchError(error => this.handleError('Failed to load application', error))
    );
  }

  // POST - Create new application
  createApplication(request: ApplicationRequest): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(this.endpoint, request).pipe(
      catchError(error => this.handleError('Failed to load application', error))
    );
  }

  // PUT - Update existing application
  updateApplication(id: number, request: ApplicationRequest): Observable<ApplicationResponse> {
    return this.http.put<ApplicationResponse>(`${this.endpoint}/${id}`, request).pipe(
      catchError(error => this.handleError('Failed to load application', error))
    );
  }

  // DELETE - Remove application
  deleteApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`).pipe(
      catchError(error => this.handleError('Failed to load application', error))
    );
  }

  // GET applications by status
  getApplicationsByStatus(status: string): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.endpoint}/status/${status}`).pipe(
      catchError(error => this.handleError('Failed to load application', error))
    );
  }

  // GET applications by candidate
  getApplicationsByCandidate(candidateId: number): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.endpoint}/candidate/${candidateId}`).pipe(
      catchError(error => this.handleError('Failed to load application', error))
    );
  }

  // GET applications by job
  getApplicationsByJob(jopId: number): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.endpoint}/job/${jopId}`).pipe(
      catchError(error => this.handleError('Failed to load application', error))
    );
  }

  // Search applications
  searchApplications(query: string): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.endpoint}/search`, {
      params: { q: query }
    }).pipe(
      catchError(error => this.handleError('Failed to load application', error))
    );
  }

  private handleError(operation: string, error: any): Observable<never> {
    console.error(`${operation}:`, error);

    const errorDetails: ErrorDetails = {
      title: 'Operation Failed',
      message: `${operation}. ${error.error?.message || error.message || 'Please try again later.'}`,
      statusCode: error.status,
      timestamp: new Date()
    };

    // Show error modal
    this.errorService.showError(errorDetails);

    // Re-throw the error
    return throwError(() => error);
  }

}
