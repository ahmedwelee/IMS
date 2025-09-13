import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {DatePipe, Location, NgForOf, NgIf, SlicePipe} from '@angular/common';
import { JobRequest } from '../../../service/job-request';
import { JobResponse } from '../../../service/job-response';
import {FormsModule} from "@angular/forms";
import {ClientResponse} from "../../../service/client-response";
import {JobService} from "../../../service/job.service";
import {ClientsService} from "../../../service/clients.service";
import {EmployeesService} from "../../../service/employee.service";
import {EmployeeResponse} from "../../../service/employee-response";

@Component({
  selector: 'app-client-jobs',
  templateUrl: './client-jobs-component.html',
  standalone: true,
  imports: [
    DatePipe,
    NgIf,
    FormsModule,
    SlicePipe,
    NgForOf
  ],
})
export class ClientJobsComponent implements OnInit {
  clientId: number = 0;
  client: ClientResponse | null = null;
  jobs: JobResponse[] = [];
  showAddJobModal: boolean = false;
  showDeleteJobModal: boolean = false;
  jobToDelete: JobResponse | null = null;

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

  managers: EmployeeResponse[] = [];
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private jobService: JobService,
    private clientsService: ClientsService,
    private employeeService: EmployeesService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.clientId = +params['id'];
      if (this.clientId) {
        this.loadClientAndJobs();
        this.loadManagers();
      }
    });

    // Get client data from navigation state if available
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['client']) {
      this.client = navigation.extras.state['client'];
    }
  }

  loadClientAndJobs(): void {
    this.isLoading = true;

    // Load client info if not already available
    if (!this.client) {
      this.clientsService.getClientById(this.clientId).subscribe({
        next: (client) => {
          this.client = client;
        },
        error: (error) => {
          console.error('Error loading client:', error);
        }
      });
    }

    // Load client jobs
    this.jobService.getJobsByClient(this.clientId).subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading client jobs:', error);
        this.jobs = [];
        this.isLoading = false;
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

  openAddJobModal(): void {
    this.newJob = {
      jopName: '',
      description: '',
      salary: 0,
      jobType: 'FULL_TIME',
      location: '',
      status: 'OPEN',
      postedDate: new Date(),
      clientId: this.clientId,
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
    this.jobService.createJob(this.newJob).subscribe({
      next: (createdJob) => {
        this.jobs.push(createdJob);
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
        this.jobs = this.jobs.filter(j => j.id !== jobId);
        this.closeDeleteJobModal();
      },
      error: (error) => {
        console.error('Error deleting job:', error);
        this.closeDeleteJobModal();
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  // Utility methods
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

  getManagerName(managerId: string | null | undefined): string {
    if (!managerId) return 'Not assigned';
    const manager = this.managers.find(m => m.fullName === managerId);
    return manager?.fullName || 'Unknown manager';
  }

  trackByJobId(index: number, job: JobResponse): number {
    return job.id;
  }

  // Client type badge class method for client info display
  getClientTypeBadgeClass(type: string | undefined): string {
    if (!type) return 'bg-secondary';

    switch (type) {
      case 'INDIVIDUAL': return 'bg-primary';
      case 'COMPANY': return 'bg-success';
      case 'ORGANIZATION': return 'bg-info';
      case 'GOVERNMENT': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }
}
