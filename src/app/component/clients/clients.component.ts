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
import {ToastrService} from "ngx-toastr";


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
  showClientDetailsModal: boolean = false; // New modal property
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
    private router: Router,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadEmployees();
    this.loadClients();
  }

  loadClients(): void {
    this.clientsService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.initializeFilters();
      },
      error: (error) => {
        this.toastService.error('Error loading clients', error);
      }
    });
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (error) => {
        this.toastService.error(error.error.error, 'Oups!!');
        this.employees = [];
      }
    });
  }

  // Client Details Modal Methods
  openClientDetailsModal(client: ClientResponse): void {
    this.selectedClient = client;
    this.showClientDetailsModal = true;
  }

  closeClientDetailsModal(): void {
    this.showClientDetailsModal = false;
    this.selectedClient = null;
  }

  // Updated loadClient method to use modal

  // Navigation method for viewing client jobs
  viewClientJobs(clientId: number): void {
    this.router.navigate(['/client-jobs', clientId]);
  }

  // Alternative method if you want to pass client data
  onViewClientJobs(clientId: number | undefined): void {
    if (clientId) {
      const client = this.clients.find(c => c.id === clientId);
      this.router.navigate(['/client-jobs', clientId], {
        state: { client: client }
      });
    }
  }

  // Create/Edit Modal Methods
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
        this.toastService.success('Client created successfully', 'Success');
        this.closeModal();
      },
      error: (error) => {
        this.toastService.error(error.error.error, 'Oups!!');
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
        this.toastService.success('Client updated successfully', 'Success');
        if (this.showClientDetailsModal) {
          this.selectedClient = updatedClient;
        }
      },
      error: (error) => {
        this.toastService.error(error.error.error, 'Oups!!');
      }
    });
  }

  // Delete Modal Methods
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
          this.showClientDetailsModal = false;
        }
        this.toastService.success('Client deleted successfully', 'Success');
        this.closeDeleteClientModal();
      },
      error: (error) => {
        this.toastService.error(error.error.error, 'Oups!!');
        this.closeDeleteClientModal();
      }
    });
  }

  // Quick Action Methods for Client Details Modal
  editClientFromModal(client: ClientResponse): void {
    this.closeClientDetailsModal(); // Close details modal
    this.openEditModal(client); // Open edit modal
  }

  deleteClientFromModal(client: ClientResponse): void {
    this.closeClientDetailsModal(); // Close details modal
    this.openDeleteClientModal(client); // Open delete modal
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

  // Add these properties to your existing client component

// Filter properties
  searchText: string = '';
  typeFilter: string = 'ALL';
  managerFilter: string = 'ALL';

// Filtered results
  filteredClients: any[] = [];

// Filter options
  filterTypeOptions: string[] = ['ALL', 'INDIVIDUAL', 'COMPANY', 'ORGANIZATION', 'GOVERNMENT'];

// Dynamic filter options based on client data
  uniqueManagers: (string | null)[] = [];


// Initialize filter options based on client data
  initializeFilters(): void {
    if (this.clients && this.clients.length > 0) {
      // Extract unique business managers using employeeName
      this.uniqueManagers = [...new Set(this.clients
        .map(client => client.employeeName)
        .filter(manager => manager && manager.trim() !== '')
      )].sort();

      // Apply initial filters
      this.applyFilters();
    }
  }

// Main filter application method
  applyFilters(): void {
    if (!this.clients) {
      this.filteredClients = [];
      return;
    }

    this.filteredClients = this.clients.filter(client => {
      return this.matchesSearchFilter(client) &&
        this.matchesTypeFilter(client) &&
        this.matchesManagerFilter(client);
    });
  }

// Individual filter methods
  matchesSearchFilter(client: any): boolean {
    if (!this.searchText || this.searchText.trim() === '') return true;

    const searchLower = this.searchText.toLowerCase();
    return (
      (client.name?.toLowerCase().includes(searchLower)) ||
      (client.email?.toLowerCase().includes(searchLower)) ||
      (client.address?.toLowerCase().includes(searchLower)) ||
      (client.phoneNumber?.toLowerCase().includes(searchLower)) ||
      (client.employeeName?.toLowerCase().includes(searchLower))
    );
  }

  matchesTypeFilter(client: any): boolean {
    if (this.typeFilter === 'ALL') return true;
    return client.type === this.typeFilter;
  }

  matchesManagerFilter(client: any): boolean {
    if (this.managerFilter === 'ALL') return true;
    return client.employeeName === this.managerFilter;
  }

// Clear filter methods
  clearFilters(): void {
    this.searchText = '';
    this.typeFilter = 'ALL';
    this.managerFilter = 'ALL';
    this.applyFilters();
  }

  clearSearchFilter(): void {
    this.searchText = '';
    this.applyFilters();
  }

  clearTypeFilter(): void {
    this.typeFilter = 'ALL';
    this.applyFilters();
  }

  clearManagerFilter(): void {
    this.managerFilter = 'ALL';
    this.applyFilters();
  }

// Helper methods
  hasActiveFilters(): boolean {
    return this.searchText !== '' ||
      this.typeFilter !== 'ALL' ||
      this.managerFilter !== 'ALL';
  }


}
