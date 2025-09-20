import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeRequest } from './employee-request';
import { EmployeeResponse } from './employee-response';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {

  readonly apiUrl = 'http://localhost:8088';
  private readonly endpoint = `${this.apiUrl}/employees`;

  constructor(private http: HttpClient) { }

  getAllEmployees(): Observable<EmployeeResponse[]> {
    return this.http.get<EmployeeResponse[]>(this.endpoint);
  }

  getEmployeeById(id: number): Observable<EmployeeResponse> {
    return this.http.get<EmployeeResponse>(`${this.endpoint}/${id}`);
  }

  createEmployee(request: EmployeeRequest): Observable<EmployeeResponse> {
    return this.http.post<EmployeeResponse>(this.endpoint, request);
  }

  updateEmployee(id: number, request: EmployeeRequest): Observable<EmployeeResponse> {
    return this.http.put<EmployeeResponse>(`${this.endpoint}/${id}`, request);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }

  getEmployeesByClient(clientName: string): Observable<EmployeeResponse[]> {
    return this.http.get<EmployeeResponse[]>(`${this.endpoint}/client/${clientName}`);
  }

  getEmployeesByPosition(position: string): Observable<EmployeeResponse[]> {
    return this.http.get<EmployeeResponse[]>(`${this.endpoint}/position/${position}`);
  }

  getEmployeesCount(): Observable<number> {
    return this.http.get<number>(`${this.endpoint}/count`);
  }


  getManagers() {
    return this.http.get<EmployeeResponse[]>(`${this.endpoint}/managers`);
  }
}
