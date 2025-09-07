import { Component, OnInit } from '@angular/core';
import { ClientsService } from '../../service/clients.service';
import { EmployeesService } from '../../service/employee.service'; // Import EmployeeService
import { ClientRequest } from '../../service/clients-request';
import { ClientResponse } from '../../service/client-response';
import { EmployeeResponse } from '../../service/employee-response';
import {DatePipe, NgForOf, NgIf, UpperCasePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";

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
    private employeeService: EmployeesService
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
        // Fallback to empty array if there's an error
        this.employees = [];
      }
    });
  }

  // Get single client
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

  // Open create modal
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
        console.log('Client created:', createdClient);
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
        console.log('Client updated:', updatedClient);
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

  deleteClient(id: number): void {
    if (confirm('Are you sure you want to delete this client?')) {
      this.clientsService.deleteClient(id).subscribe({
        next: () => {
          console.log('Client deleted successfully');
          this.clients = this.clients.filter(c => c.id !== id);
          if (this.selectedClient?.id === id) {
            this.selectedClient = null;
          }
        },
        error: (error) => {
          console.error('Error deleting client:', error);
        }
      });
    }
  }

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
      case 'GOVERNMENT': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  hasJobs(jopNames: string[] | undefined): boolean {
    return !!jopNames && jopNames.length > 0;
  }
}
