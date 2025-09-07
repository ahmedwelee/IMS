import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientRequest } from './clients-request';
import { ClientResponse } from './client-response';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  readonly apiUrl = 'http://localhost:8088';
  private readonly endpoint = `${this.apiUrl}/clients`;

  constructor(private http: HttpClient) { }


  getAllClients(): Observable<ClientResponse[]> {
    return this.http.get<ClientResponse[]>(this.endpoint);
  }

  getClientById(id: number): Observable<ClientResponse> {
    return this.http.get<ClientResponse>(`${this.endpoint}/${id}`);
  }


  createClient(request: ClientRequest): Observable<ClientResponse> {
    return this.http.post<ClientResponse>(this.endpoint, request);
  }


  updateClient(id: number, request: ClientRequest): Observable<ClientResponse> {
    return this.http.put<ClientResponse>(`${this.endpoint}/${id}`, request);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }

  searchClientsByName(name: string): Observable<ClientResponse[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<ClientResponse[]>(`${this.endpoint}/search`, { params });
  }

  getClientsByType(type: string): Observable<ClientResponse[]> {
    const params = new HttpParams().set('type', type);
    return this.http.get<ClientResponse[]>(this.endpoint, { params });
  }

  getClientsByEmployee(employeeId: number): Observable<ClientResponse[]> {
    const params = new HttpParams().set('employeeId', employeeId.toString());
    return this.http.get<ClientResponse[]>(this.endpoint, { params });
  }
}
