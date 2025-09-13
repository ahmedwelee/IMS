import { Component, OnInit } from '@angular/core';
import { ClientsService } from '../../service/clients.service';
import { EmployeesService } from '../../service/employee.service'; // Import EmployeeService
import { ClientRequest } from '../../service/clients-request';
import { ClientResponse } from '../../service/client-response';
import { EmployeeResponse } from '../../service/employee-response';
import {DatePipe, NgForOf, NgIf,  UpperCasePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {JobService} from "../../service/job.service";
import {Router} from "@angular/router";


@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    UpperCasePipe,
    NgForOf,
    NgIf
  ],
  templateUrl: './clients.component.html'
})
export class ClientsComponent implements OnInit {
  clients: ClientResponse[] = [];
  selectedClient: ClientResponse | null = null;
  showModal: boolean = false;
  isEditMode: boolean = false;
  showDeleteClientModal: boolean = false;
  clientToDelete: ClientResponse | null = null;

  currentClient: ClientRequest = {
    name: '',
    type: 'INDIVIDUAL',
    phoneNumber: '',
    address: '',
    email: '',
    employeeId: null
  };

  employees: EmployeeResponse[] = [];

  constructor(
    private clientsService: ClientsService,
    private employeeService: EmployeesService,
    private jobService: JobService,
    private router: Router  // Add Router injection
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadEmployees();
  }

  loadClients(): void {
    this.clientsService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
      }
    });
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

  loadClient(id: number): void {
    this.clientsService.getClientById(id).subscribe({
      next: (client) => {
        this.selectedClient = client;
      },
      error: (error) => {
        console.error('Error loading client:', error);
      }
    });
  }

  // Navigation method for viewing client jobs
  viewClientJobs(clientId: number): void {
    this.router.navigate(['/client-jobs', clientId]);
  }

  // Alternative method if you want to pass client data
  onViewClientJobs(clientId: number | undefined): void {
    if (clientId) {
      const client = this.clients.find(c => c.id === clientId);
      this.router.navigate(['/client-jobs', clientId], {
        state: { client: client }  // Pass client data if needed
      });
    }
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentClient = {
      name: '',
      type: 'INDIVIDUAL',
      phoneNumber: '',
      address: '',
      email: '',
      employeeId: null
    };
    this.showModal = true;
  }

  openEditModal(client: ClientResponse): void {
    this.isEditMode = true;
    this.currentClient = {
      name: client.name,
      type: client.type,
      phoneNumber: client.phoneNumber,
      address: client.address,
      email: client.email,
      employeeId: client.employeeId
    };
    this.selectedClient = client;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedClient = null;
  }

  createNewClient(): void {
    this.clientsService.createClient(this.currentClient).subscribe({
      next: (createdClient) => {
        this.clients.push(createdClient);
        this.closeModal();
      },
      error: (error) => {
        console.error('Error creating client:', error);
      }
    });
  }

  updateExistingClient(): void {
    if (!this.selectedClient?.id) return;

    this.clientsService.updateClient(this.selectedClient.id, this.currentClient).subscribe({
      next: (updatedClient) => {
        const index = this.clients.findIndex(c => c.id === updatedClient.id);
        if (index !== -1) {
          this.clients[index] = updatedClient;
        }
        this.selectedClient = updatedClient;
        this.closeModal();
      },
      error: (error) => {
        console.error('Error updating client:', error);
      }
    });
  }

  openDeleteClientModal(client: ClientResponse): void {
    this.clientToDelete = client;
    this.showDeleteClientModal = true;
  }

  closeDeleteClientModal(): void {
    this.showDeleteClientModal = false;
    this.clientToDelete = null;
  }

  confirmDeleteClient(): void {
    const clientId = this.clientToDelete?.id;
    if (!clientId) return;

    this.clientsService.deleteClient(clientId).subscribe({
      next: () => {
        this.clients = this.clients.filter(c => c.id !== clientId);
        if (this.selectedClient?.id === clientId) {
          this.selectedClient = null;
        }
        this.closeDeleteClientModal();
      },
      error: (error) => {
        console.error('Error deleting client:', error);
        this.closeDeleteClientModal();
      }
    });
  }

  // Utility methods
  getEmployeeName(employeeId: number | null | undefined): string {
    if (!employeeId) return 'Not assigned';
    const employee = this.employees.find(e => e.id === employeeId);
    return employee?.fullName || 'Unknown employee';
  }

  getTypeBadgeClass(type: string | undefined): string {
    if (!type) return 'bg-secondary';

    switch (type) {
      case 'INDIVIDUAL': return 'bg-primary';
      case 'COMPANY': return 'bg-success';
      case 'ORGANIZATION': return 'bg-info';
      case 'GOVERNMENT': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  hasJobs(jobsCount: number | number[] | undefined): boolean {
    if (typeof jobsCount === 'number') {
      return jobsCount > 0;
    } else if (Array.isArray(jobsCount)) {
      return jobsCount.length > 0;
    }
    return false;
  }

  getJobsCountDisplay(jobsCount: number | number[] | undefined): number {
    if (typeof jobsCount === 'number') {
      return jobsCount;
    } else if (Array.isArray(jobsCount)) {
      return jobsCount.length;
    }
    return 0;
  }
}
