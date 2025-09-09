import {Component, OnInit} from '@angular/core';
import {NgIf, NgFor, SlicePipe} from '@angular/common';
import { FormsModule } from '@angular/forms';
import {JobResponse} from "../../service/job-response";
import {JobRequest} from "../../service/job-request";
import {JobService} from "../../service/job.service";
import {EmployeeResponse} from "../../service/employee-response";
import {ClientResponse} from "../../service/client-response";
import {EmployeesService} from "../../service/employee.service";
import {ClientsService} from "../../service/clients.service";


@Component({
  selector: 'app-job',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './job.component.html'
})
export class JobsComponent implements OnInit {
  jobs: JobResponse[] = [];
  selectedJob: JobResponse | null = null;
  showModal: boolean = false;
  isEditMode: boolean = false;
  currentJob: JobRequest = {
    jopName: '',
    description: '',
    salary: 0,
    jobType: 'FULL_TIME',
    location: '',
    status: 'OPEN',
    postedDate: new Date().toISOString().split('T')[0],
    clientId: null,
    managerId: null
  };

  jobTypes: string[] = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'INTERNSHIP'];
  statusOptions: string[] = ['OPEN', 'CLOSED', 'DRAFT', 'PENDING'];
  clients: ClientResponse[] = [];
  managers: EmployeeResponse[] = [];

  constructor(
    private jobService: JobService,
    private clientService: ClientsService,
    private employeeService: EmployeesService
  ) {}

  ngOnInit(): void {
    this.loadJobs();
    this.loadClientsAndManagers();
  }

  // Load all jobs
  loadJobs(): void {
    this.jobService.getAllJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
      }
    });
  }

  // Load clients and managers from database
  loadClientsAndManagers(): void {
    // Load clients
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.clients = [];
      }
    });

    // Load managers
    this.employeeService.getManagers().subscribe({
      next: (managers) => {
        this.managers = managers;
      },
      error: (error) => {
        console.error('Error loading managers:', error);
        // Fallback: if no specific manager endpoint, get all employees and filter
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

  // Get single job
  loadJob(id: number): void {
    this.jobService.getJobById(id).subscribe({
      next: (job) => {
        this.selectedJob = job;
      },
      error: (error) => {
        console.error('Error loading job:', error);
      }
    });
  }

  // Open create modal
  openCreateModal(): void {
    this.isEditMode = false;
    this.currentJob = {
      jopName: '',
      description: '',
      salary: 0,
      jobType: 'FULL_TIME',
      location: '',
      status: 'OPEN',
      postedDate: new Date().toISOString().split('T')[0],
      clientId: null,
      managerId: null
    };
    this.showModal = true;
  }

  // Open edit modal - FIXED THIS METHOD
  openEditModal(job: JobResponse): void {
    this.isEditMode = true;

    // Find client ID by matching client name
    const client = this.clients.find(c => c.name === job.clientName);

    // Find manager ID by matching manager name (assuming managerName is the full name)
    const manager = this.managers.find(m => m.fullName === job.managerName);

    this.currentJob = {
      jopName: job.jopName,
      description: job.description,
      salary: job.salary,
      jobType: job.jobType,
      location: job.location,
      status: job.status,
      postedDate: job.postedDate,
      clientId: client?.id || null,
      managerId: manager?.id || null
    };
    this.selectedJob = job;
    this.showModal = true;
  }

  // Close modal
  closeModal(): void {
    this.showModal = false;
    this.selectedJob = null;
  }

  // Create new job
  createNewJob(): void {
    this.jobService.createJob(this.currentJob).subscribe({
      next: (createdJob) => {
        this.jobs.push(createdJob);
        this.closeModal();
      },
      error: (error) => {
        console.error('Error creating job:', error);
      }
    });
  }

  // Update job
  updateExistingJob(): void {
    if (!this.selectedJob?.id) return;

    this.jobService.updateJob(this.selectedJob.id, this.currentJob).subscribe({
      next: (updatedJob) => {
        const index = this.jobs.findIndex(j => j.id === updatedJob.id);
        if (index !== -1) {
          this.jobs[index] = updatedJob;
        }
        this.selectedJob = updatedJob;
        this.closeModal();
      },
      error: (error) => {
        console.error('Error updating job:', error);
      }
    });
  }

  // Delete job
  deleteJob(id: number): void {
    if (confirm('Are you sure you want to delete this job?')) {
      this.jobService.deleteJob(id).subscribe({
        next: () => {
          this.jobs = this.jobs.filter(j => j.id !== id);
          if (this.selectedJob?.id === id) {
            this.selectedJob = null;
          }
        },
        error: (error) => {
          console.error('Error deleting job:', error);
        }
      });
    }
  }

  // Format salary with commas
  formatSalary(salary: number | undefined): string {
    if (!salary) return '0';
    return salary.toLocaleString('en-US');
  }

  // Get status badge class - handle undefined
  getStatusBadgeClass(status: string | undefined): string {
    if (!status) return 'bg-secondary';

    switch (status) {
      case 'OPEN': return 'bg-success';
      case 'CLOSED': return 'bg-danger';
      case 'DRAFT': return 'bg-warning';
      case 'PENDING': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  // Get job type badge class - handle undefined
  getJobTypeBadgeClass(jobType: string | undefined): string {
    if (!jobType) return 'bg-light text-dark';

    switch (jobType) {
      case 'FULL_TIME': return 'bg-primary';
      case 'PART_TIME': return 'bg-info';
      case 'CONTRACT': return 'bg-warning';
      case 'REMOTE': return 'bg-success';
      case 'INTERNSHIP': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  }

  // Format date - handle undefined
  formatDate(date: string | undefined): string {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString();
  }

  // Get client name by ID - handle undefined
  getClientName(clientId: number | null | undefined): string {
    if (!clientId) return 'Not assigned';
    const client = this.clients.find(c => c.id === clientId);
    return client?.name || 'Unknown client';
  }

  // Get manager name by ID - handle undefined
  getManagerName(managerId: number | null | undefined): string {
    if (!managerId) return 'Not assigned';
    const manager = this.managers.find(m => m.id === managerId);
    return manager?.fullName || 'Unknown manager';
  }

  // Safe display for job type
  getJobTypeDisplay(jobType: string | undefined): string {
    if (!jobType) return 'Unknown';
    return jobType;
  }

  // Safe display for status
  getStatusDisplay(status: string | undefined): string {
    if (!status) return 'Unknown';
    return status;
  }
}
