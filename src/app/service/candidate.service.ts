import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {CandidateResponse} from "./candidate-response";
import {CandidateRequest} from "./candidate-request";


@Injectable({
  providedIn: 'root'
})
export class CandidateService {

  readonly apiUrl = 'http://localhost:8088';
  private readonly endpoint = `${this.apiUrl}/candidates`;

  constructor(
    private http: HttpClient,
  ) {
  }

  getCandidateByEmail(email: string): Observable<{ id: number, email: string, username?: string }> {
    return this.http.get<{ id: number, email: string, username?: string }>(
      `${this.endpoint}/email/${email}`
    );
  }

  getAll(): Observable<CandidateResponse[]> {
    return this.http.get<CandidateResponse[]>(this.endpoint);
  }

  getById(id: number): Observable<CandidateResponse> {
    return this.http.get<CandidateResponse>(`${this.endpoint}/${id}`);
  }

  getByEmail(email: string): Observable<CandidateResponse> {
    return this.http.get<CandidateResponse>(`${this.endpoint}/email/${email}`);
  }

  create(candidate: CandidateRequest): Observable<CandidateResponse> {
    return this.http.post<CandidateResponse>(this.endpoint, candidate);
  }

  update(id: number, candidate: CandidateRequest): Observable<CandidateResponse> {
    return this.http.put<CandidateResponse>(`${this.endpoint}/${id}`, candidate);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }

  updateStatus(id: number, isActive: boolean): Observable<CandidateResponse> {
    return this.http.patch<CandidateResponse>(
      `${this.endpoint}/${id}/status?isActive=${isActive}`,
      {}
    );
  }


}
