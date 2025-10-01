import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

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

}
