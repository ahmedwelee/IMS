import { Component, OnInit } from '@angular/core';
import { ClientsService } from '../../service/clients.service';
import { EmployeesService } from '../../service/employee.service'; // Import EmployeeService
import { ClientRequest } from '../../service/clients-request';
import { ClientResponse } from '../../service/client-response';
import { EmployeeResponse } from '../../service/employee-response';
import {DatePipe, DecimalPipe, NgForOf, NgIf, SlicePipe, UpperCasePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {JobService} from "../../service/job.service";
import {JobResponse} from "../../service/job-response";
import {JobRequest} from "../../service/job-request";

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    UpperCasePipe,
    NgForOf,
    NgIf,
    SlicePipe
  ],
  templateUrl: './clients.component.html'
})
export class ClientsComponent implements OnInit {
  clients: ClientResponse[] = [];
  selectedClient: ClientResponse | null = null;
  showModal: boolean = false;
  isEditMode: boolean = false;
  showJobsModal: boolean = false;
  showDeleteJobModal: boolean = false;
  showDeleteClientModal: boolean = false;
  showAddJobModal: boolean = false;
  clientJobs: JobResponse[] = [];
  clientToDelete: ClientResponse | null = null;
  jobToDelete: JobResponse | null = null;

  currentClient: ClientRequest = {
    name: '',
    type: 'INDIVIDUAL',
    phoneNumber: '',
    address: '',
    email: '',
    employeeId: null
  };

  // For new job form
  newJob: JobRequest = {
    jopName: '',
    description: '',
    salary: 0,
    jobType: 'FULL_TIME',
    location: '',
    status: 'OPEN',
    postedDate: new Date(),
    clientId: null,
    managerId: null
  };

  jobTypes: any[] = [
    {label: 'Full time', value: 'FULL_TIME'},
    {label: 'Internship', value: 'INTERNSHIP'},
    {label: 'Part time', value: 'PART_TIME'},
    {label: 'Contract', value: 'CONTRACT'},
    {label: 'Remote', value: 'REMOTE'}
  ];

  statusOptions: any[] = [
    {label: 'Open', value: 'OPEN'},
    {label: 'Closed', value: 'CLOSED'},
    {label: 'Draft', value: 'DRAFT'},
    {label: 'Pending', value: 'PENDING'}
  ];

  employees: EmployeeResponse[] = [];
  managers: EmployeeResponse[] = [];

  constructor(
    private clientsService: ClientsService,
    private employeeService: EmployeesService,
    private jobService: JobService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadEmployees();
    this.loadManagers();
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

  loadManagers(): void {
    this.employeeService.getManagers().subscribe({
      next: (managers) => {
        this.managers = managers;
      },
      error: (error) => {
        console.error('Error loading managers:', error);
        this.employeeService.getAllEmployees().subscribe({
          next: (employees) => {
            this.managers = employees.filter(emp =>
              emp.position === 'MANAGER' || emp.position === 'DIRECTOR'
            );
          },
          error: (err) => {
            console.error('Error loading employees for managers:', err);
            this.managers = [];
          }
        });
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

  // Close delete client modal
  closeDeleteClientModal(): void {
    this.showDeleteClientModal = false;
    this.clientToDelete = null;
  }

  // Delete client (confirmed from modal)
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

  // In your component
  // Job management methods
  viewClientJobs(clientId: number): void {
    this.jobService.getJobsByClient(clientId).subscribe({
      next: (jobs) => {
        this.clientJobs = jobs;
        this.showJobsModal = true;
      },
      error: (error) => {
        console.error('Error loading client jobs:', error);
        this.clientJobs = [];
        this.showJobsModal = true;
      }
    });
  }

// Also update the onViewClientJobs method if it exists:
  onViewClientJobs(clientId: number | undefined): void {
    if (clientId) {
      this.viewClientJobs(clientId);
    }
  }


  closeJobsModal(): void {
    this.showJobsModal = false;
    this.clientJobs = [];
  }

  openAddJobModal(): void {
    if (!this.selectedClient) return;

    this.newJob = {
      jopName: '',
      description: '',
      salary: 0,
      jobType: 'FULL_TIME',
      location: '',
      status: 'OPEN',
      postedDate: new Date(),
      clientId: this.selectedClient.id,
      managerId: null
    };
    this.showAddJobModal = true;
  }

  closeAddJobModal(): void {
    this.showAddJobModal = false;
    this.newJob = {
      jopName: '',
      description: '',
      salary: 0,
      jobType: 'FULL_TIME',
      location: '',
      status: 'OPEN',
      postedDate: new Date(),
      clientId: null,
      managerId: null
    };
  }

  createNewJob(): void {
    if (!this.selectedClient) return;

    this.jobService.createJob(this.newJob).subscribe({
      next: (createdJob) => {
        this.clientJobs.push(createdJob);
        this.closeAddJobModal();
      },
      error: (error) => {
        console.error('Error creating job:', error);
      }
    });
  }

  openDeleteJobModal(job: JobResponse): void {
    this.jobToDelete = job;
    this.showDeleteJobModal = true;
  }

  closeDeleteJobModal(): void {
    this.showDeleteJobModal = false;
    this.jobToDelete = null;
  }

  confirmDeleteJob(): void {
    const jobId = this.jobToDelete?.id;
    if (!jobId) return;

    this.jobService.deleteJob(jobId).subscribe({
      next: () => {
        this.clientJobs = this.clientJobs.filter(j => j.id !== jobId);
        this.closeDeleteJobModal();
      },
      error: (error) => {
        console.error('Error deleting job:', error);
        this.closeDeleteJobModal();
      }
    });
  }

  // Utility methods
  getEmployeeName(employeeId: number | null | undefined): string {
    if (!employeeId) return 'Not assigned';
    const employee = this.employees.find(e => e.id === employeeId);
    return employee?.fullName || 'Unknown employee';
  }

  getManagerName(managerId: number | null | undefined): string {
    if (!managerId) return 'Not assigned';
    const manager = this.managers.find(m => m.id === managerId);
    return manager?.fullName || 'Unknown manager';
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

  getJobTypeBadgeClass(jobType: string | undefined): string {
    if (!jobType) return 'bg-secondary';

    switch (jobType) {
      case 'FULL_TIME': return 'bg-primary';
      case 'PART_TIME': return 'bg-info';
      case 'CONTRACT': return 'bg-warning text-dark';
      case 'REMOTE': return 'bg-success';
      case 'INTERNSHIP': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  }

  getJobStatusBadgeClass(status: string | undefined): string {
    if (!status) return 'bg-secondary';

    switch (status) {
      case 'OPEN': return 'bg-success';
      case 'CLOSED': return 'bg-danger';
      case 'DRAFT': return 'bg-warning text-dark';
      case 'PENDING': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getJobTypeDisplay(jobType: string | undefined): string {
    if (!jobType) return 'Unknown';

    const type = this.jobTypes.find(t => t.value === jobType);
    return type ? type.label : jobType;
  }

  getStatusDisplay(status: string | undefined): string {
    if (!status) return 'Unknown';

    const statusObj = this.statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  formatSalary(salary: number | undefined): string {
    if (!salary) return '0';
    return salary.toLocaleString('en-US');
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
