import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobRequest } from './job-request';
import { JobResponse } from './job-response';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  readonly apiUrl = 'http://localhost:8088';
  private readonly endpoint = `${this.apiUrl}/jobs`;

  constructor(private http: HttpClient) { }

  getAllJobs(): Observable<JobResponse[]> {
    return this.http.get<JobResponse[]>(this.endpoint);
  }
  openJobsGetAll(): Observable<JobResponse[]> {
    return this.http.get<JobResponse[]>(`${this.endpoint}/open-jobs/getALl`);
  }

  getJobById(id: number): Observable<JobResponse> {
    return this.http.get<JobResponse>(`${this.endpoint}/${id}`);
  }

  getJobsCount(): Observable<number> {
    return this.http.get<number>(`${this.endpoint}/count`);
  }


  createJob(request: JobRequest): Observable<JobResponse> {
    return this.http.post<JobResponse>(this.endpoint, request);
  }

  updateJob(id: number, request: JobRequest): Observable<JobResponse> {
    return this.http.put<JobResponse>(`${this.endpoint}/${id}`, request);
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }


  getJobsByStatus(status: string): Observable<JobResponse[]> {
    return this.http.get<JobResponse[]>(`${this.endpoint}/status/${status}`);
  }

  // GET jobs by client
  getJobsByClient(clientId: number): Observable<JobResponse[]> {
    return this.http.get<JobResponse[]>(`${this.endpoint}/client/${clientId}`);
  }


  getJobsByType(jobType: string): Observable<JobResponse[]> {
    return this.http.get<JobResponse[]>(`${this.endpoint}/type/${jobType}`);
  }

}
