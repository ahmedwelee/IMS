import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApplicationRequest } from './application-request';
import { ApplicationResponse } from './application-response';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  readonly apiUrl = 'http://localhost:8088';
  private readonly endpoint = `${this.apiUrl}/applications`;

  constructor(
    private http: HttpClient,
  ) {
  }

  // GET all applications
  getAllApplications(): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(this.endpoint);
  }

  // GET application by ID
  getApplicationById(id: number): Observable<ApplicationResponse> {
    return this.http.get<ApplicationResponse>(`${this.endpoint}/${id}`);
  }

  // POST - Create new application
  createApplication(request: ApplicationRequest): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(this.endpoint, request);
  }

  // PUT - Update existing application
  updateApplication(id: number, request: ApplicationRequest): Observable<ApplicationResponse> {
    return this.http.put<ApplicationResponse>(`${this.endpoint}/${id}`, request);
  }

  // DELETE - Remove application
  deleteApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }

  // GET applications by status
  getApplicationsByStatus(status: string): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.endpoint}/status/${status}`);
  }

  // GET applications by candidate
  getApplicationsByCandidate(candidateId: number): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.endpoint}/candidate/${candidateId}`);
  }

  // GET applications by job
  getApplicationsByJob(jopId: number): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.endpoint}/job/${jopId}`);
  }

  getApplicationCount(): Observable<number> {
    return this.http.get<number>(`${this.endpoint}/count`);
  }

  // Search applications
  searchApplications(query: string): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.endpoint}/search`, {
      params: { q: query }
    });
  }



}
