import {Component, OnInit} from '@angular/core';
import {NgIf, NgFor, DatePipe, SlicePipe, DecimalPipe} from '@angular/common';
import { FormsModule } from '@angular/forms';
import {JobResponse} from "../../service/job-response";
import {JobRequest} from "../../service/job-request";
import {JobService} from "../../service/job.service";
import {EmployeeResponse} from "../../service/employee-response";
import {ClientResponse} from "../../service/client-response";
import {EmployeesService} from "../../service/employee.service";
import {ClientsService} from "../../service/clients.service";
import {Router} from "@angular/router";
import {Chart} from "chart.js";


@Component({
  selector: 'app-job',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, DatePipe, SlicePipe, DecimalPipe],
  templateUrl: './job.component.html'
})
export class JobsComponent implements OnInit {
  jobs: JobResponse[] = [];
  selectedJob: JobResponse | null = null;
  showModal: boolean = false;
  isEditMode: boolean = false;
  showDeleteModal: boolean = false;


  currentJob: JobRequest = {
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

  // For delete modal
  jobToDelete: JobResponse | null = null;

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


  clients: ClientResponse[] = [];
  managers: EmployeeResponse[] = [];

  constructor(
    private jobService: JobService,
    private clientService: ClientsService,
    private router: Router,
    private employeeService: EmployeesService,
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

  // View applications for a job - navigate to applications page
  viewApplications(jobId: number): void {
    this.router.navigate(['/jobs', jobId, 'applications']);
  }

  // Open delete confirmation modal
  openDeleteModal(job: JobResponse): void {
    this.jobToDelete = job;
    this.showDeleteModal = true;
  }

  // Close delete modal
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.jobToDelete = null;
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
      postedDate: new Date(),
      clientId: null,
      managerId: null
    };
    this.showModal = true;
  }

  // Open edit modal
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

  // Delete job (confirmed from modal)
  confirmDeleteJob(): void {
    const jobId = this.jobToDelete?.id;
    if (!jobId) return;

    this.jobService.deleteJob(jobId).subscribe({
      next: () => {
        this.jobs = this.jobs.filter(j => j.id !== jobId);

        if (this.selectedJob?.id === jobId) {
          this.selectedJob = null;
        }

        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Error deleting job:', error);
        this.closeDeleteModal();
      }
    });
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
      case 'DRAFT': return 'bg-warning text-dark';
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
      case 'CONTRACT': return 'bg-warning text-dark';
      case 'REMOTE': return 'bg-success';
      case 'INTERNSHIP': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  }


  // Safe display for job type
  getJobTypeDisplay(jobType: string | undefined): string {
    if (!jobType) return 'Unknown';

    const type = this.jobTypes.find(t => t.value === jobType);
    return type ? type.label : jobType;
  }

  // Safe display for status
  getStatusDisplay(status: string | undefined): string {
    if (!status) return 'Unknown';

    const statusObj = this.statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  // Get count of jobs by status
  getStatusCount(status: string): number {
    return this.jobs.filter(job => job.status === status).length;
  }

// Calculate average salary
  getAverageSalary(): number {
    if (this.jobs.length === 0) return 0;

    const total = this.jobs.reduce((sum, job) => sum + (job.salary || 0), 0);
    return Math.round(total / this.jobs.length);
  }
}
