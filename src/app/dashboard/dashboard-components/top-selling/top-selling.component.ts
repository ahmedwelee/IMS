import { Component, OnInit } from '@angular/core';
import {ClientsService} from "../../../service/clients.service";
import {EmployeesService} from "../../../service/employee.service";
import {Router} from "@angular/router";

interface TopClient {
  id: number;
  name: string;
  email: string;
  type: string;
  jobsCount: number;
  employeeName: string;
  avatar: string;
  createdAt: string;
  status: string;
}


  @Component({
  selector: 'app-top-selling',
  templateUrl: './top-selling.component.html'
})
export class TopSellingComponent implements OnInit {

  topClients: TopClient[] = [];
  isLoading: boolean = true;
  employees: any[] = [];

  constructor(
    private clientsService: ClientsService,
    private employeeService: EmployeesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadTopClients();
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.employees = [];
      }
    });
  }

    loadTopClients(): void {
      this.clientsService.getTopClients(5).subscribe({
        next: (clients: any[]) => {
          // Backend already provides sorted + limited data
          this.topClients = clients.map(client => ({
            id: client.id,
            name: client.name,
            email: client.email,
            type: client.type,
            jobsCount: client.jobsCount,
            employeeName: client.employeeName || 'Not assigned',
            avatar: this.generateAvatar(client.name),
            createdAt: client.createdAt,
            status: this.getStatusColor(client.jobsCount)
          }));

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading clients:', error);
          this.topClients = [];
          this.isLoading = false;
        }
      });
    }



    private generateAvatar(name: string): string {
    const initials = name?.charAt(0)?.toUpperCase() || '?';
    const colors = ['primary', 'success', 'info', 'warning', 'danger', 'secondary'];
    const colorIndex = name?.charCodeAt(0) % colors.length || 0;
    return `avatar-${colors[colorIndex]}-${initials}`;
  }

  // Make this public so template can access it
  getStatusColor(jobsCount: number): string {
    if (jobsCount >= 5) return 'success';
    if (jobsCount >= 3) return 'warning';
    if (jobsCount >= 1) return 'info';
    return 'secondary';
  }

  // Your template is looking for this method name specifically
  getClientTypeBadgeClass(type: string): string {
    switch (type) {
      case 'INDIVIDUAL': return 'bg-primary';
      case 'COMPANY': return 'bg-success';
      case 'ORGANIZATION': return 'bg-info';
      case 'GOVERNMENT': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  // Keep this for backward compatibility
  getTypeBadgeClass(type: string): string {
    return this.getClientTypeBadgeClass(type);
  }

  viewClientJobs(clientId: number): void {
    this.router.navigate(['/client-jobs', clientId]);
  }



  // Date formatting methods
  formatDaysAgo(date: Date | string): string {
    if (!date) return 'Unknown';

    const now = new Date();
    const clientDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - clientDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  }


  // Statistics methods
  getActiveClientsCount(): number {
    if (!this.topClients) return 0;
    return this.topClients.filter(client => client.jobsCount > 0).length;
  }

  getTotalJobsCount(): number {
    if (!this.topClients) return 0;
    return this.topClients.reduce((total, client) => total + client.jobsCount, 0);
  }

  getAverageJobsPerClient(): string {
    if (!this.topClients || this.topClients.length === 0) return '0';
    const average = this.getTotalJobsCount() / this.topClients.length;
    return average.toFixed(1);
  }

  // Template utility methods
  trackByClientId(index: number, client: TopClient): number {
    return client.id;
  }

  getActivityLevel(jobsCount: number): string {
    if (jobsCount >= 5) return 'High Activity';
    if (jobsCount >= 3) return 'Medium Activity';
    if (jobsCount >= 1) return 'Active';
    return 'Inactive';
  }
}
