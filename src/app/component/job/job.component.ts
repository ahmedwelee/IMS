import {Component, OnInit} from '@angular/core';
import {NgIf, NgFor, DatePipe, DecimalPipe} from '@angular/common';
import { FormsModule } from '@angular/forms';
import {JobResponse} from "../../service/job-response";
import {JobRequest} from "../../service/job-request";
import {JobService} from "../../service/job.service";
import {EmployeeResponse} from "../../service/employee-response";
import {ClientResponse} from "../../service/client-response";
import {EmployeesService} from "../../service/employee.service";
import {ClientsService} from "../../service/clients.service";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";


@Component({
  selector: 'app-job',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './job.component.html'
})
export class JobsComponent implements OnInit {
  jobs: JobResponse[] = [];
  selectedJob: JobResponse | null = null;
  showModal: boolean = false;
  isEditMode: boolean = false;
  showJobDetailsModal: boolean = false;
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
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadJobs();
    this.loadClientsAndManagers();
    this.loadJobs(); // Your existing method
    this.initializeFilters();
  }



  openJobDetailsModal(job: any) {
    this.selectedJob = job;
    this.showJobDetailsModal = true;
  }


// Method to close the modal
  closeJobDetailsModal() {
    this.showJobDetailsModal = false;
    this.selectedJob = null;
  }

  // Load clients and managers from database
  loadClientsAndManagers(): void {
    // Load clients
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: (error) => {
        this.toastService.error('Error loading clients', error);
        this.clients = [];
      }
    });

    // Load managers
    this.employeeService.getManagers().subscribe({
      next: (managers) => {
        this.managers = managers;
      },
      error: (error) => {
        this.toastService.error('Error loading managers', error);
        // Fallback: if no specific manager endpoint, get all employees and filter
        this.employeeService.getAllEmployees().subscribe({
          next: (employees) => {
            this.managers = employees.filter(emp =>
              emp.position === 'MANAGER' || emp.position === 'DIRECTOR'
            );
          },
          error: (error) => {
            this.toastService.error(error.error.error, 'Oups!!')
            this.managers = [];
          }
        });
      }
    });
  }

  // Get single job

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
        this.toastService.success('Job created successfully', 'Success');
      },
      error: (error) => {
        this.toastService.error(error.error.error, 'Oups!!');
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
        this.toastService.success('Job updated successfully', 'Success');
      },
      error: (error) => {
        this.toastService.error(error.error.error, 'Oups!!');
      }
    });
  }

  editJobFromModal(job: JobResponse): void {
    // Close the details modal first
    this.closeJobDetailsModal();

    // Then open the edit modal
    setTimeout(() => {
      this.openEditModal(job);
    }, 100);
  }
  deleteJobFromModal(job: JobResponse): void {
    // Close the details modal first
    this.closeJobDetailsModal();

    // Then open the edit modal
    setTimeout(() => {
      this.openDeleteModal(job);
    }, 100);
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
        this.toastService.success('Job deleted successfully', 'Success');
      },
      error: (error) => {
        this.toastService.error(error.error.error, 'Oups!!');
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


// Filter properties
  searchText: string = '';
  statusFilter: string = 'ALL';
  typeFilter: string = 'ALL';
  salaryFilter: string = 'ALL';
  dateFilter: string = 'ALL';
  clientFilter: string = 'ALL';
  managerFilter: string = 'ALL';
  applicationFilter: string = 'ALL';
  showAdvancedFilters: boolean = false;

// Filtered results
  filteredJobs: any[] = [];

// Filter options
  filterStatusOptions: string[] = ['ALL', 'OPEN', 'CLOSED', 'PENDING', 'DRAFT'];
  filterTypeOptions: string[] = ['ALL', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'INTERNSHIP'];

  filterSalaryOptions = [
    { value: 'ALL', label: 'All Salaries' },
    { value: '0-30000', label: 'Under $30,000' },
    { value: '30000-50000', label: '$30,000 - $50,000' },
    { value: '50000-75000', label: '$50,000 - $75,000' },
    { value: '75000-100000', label: '$75,000 - $100,000' },
    { value: '100000-150000', label: '$100,000 - $150,000' },
    { value: '150000+', label: '$150,000+' }
  ];

  filterDateOptions = [
    { value: 'ALL', label: 'All Dates' },
    { value: 'TODAY', label: 'Today' },
    { value: 'WEEK', label: 'This Week' },
    { value: 'MONTH', label: 'This Month' },
    { value: '3MONTHS', label: 'Last 3 Months' },
    { value: '6MONTHS', label: 'Last 6 Months' }
  ];

  filterApplicationOptions = [
    { value: 'ALL', label: 'All Applications' },
    { value: 'NONE', label: 'No Applications' },
    { value: '1-5', label: '1-5 Applications' },
    { value: '6-10', label: '6-10 Applications' },
    { value: '11+', label: '11+ Applications' }
  ];

// Dynamic filter options based on job data
  uniqueClients: (string | null)[] = [];
  uniqueManagers: (string | null)[] = [];

// Initialize filters when component loads


// Initialize filter options based on job data
  initializeFilters(): void {
    if (this.jobs) {
      if (this.jobs.length > 0) {
        // Extract unique clients
        this.uniqueClients = [...new Set(this.jobs
          .map(job => job.clientName)
          .filter(client => client)
        )].sort();

        // Extract unique managers
        this.uniqueManagers = [...new Set(this.jobs
          .map(job => job.managerName)
          .filter(manager => manager)
        )].sort();

        // Apply initial filters
        this.applyFilters();
      }
    }
  }

// Main filter application method
  applyFilters(): void {
    if (!this.jobs) {
      this.filteredJobs = [];
      return;
    }

    this.filteredJobs = this.jobs.filter(job => {
      return this.matchesSearchFilter(job) &&
        this.matchesStatusFilter(job) &&
        this.matchesTypeFilter(job) &&
        this.matchesSalaryFilter(job) &&
        this.matchesDateFilter(job) &&
        this.matchesClientFilter(job) &&
        this.matchesManagerFilter(job) &&
        this.matchesApplicationFilter(job);
    });
  }

// Individual filter methods
  matchesSearchFilter(job: any): boolean {
    if (!this.searchText || this.searchText.trim() === '') return true;

    const searchLower = this.searchText.toLowerCase();
    return (
      (job.jopName?.toLowerCase().includes(searchLower)) ||
      (job.description?.toLowerCase().includes(searchLower)) ||
      (job.location?.toLowerCase().includes(searchLower)) ||
      (job.clientName?.toLowerCase().includes(searchLower)) ||
      (job.managerName?.toLowerCase().includes(searchLower))
    );
  }

  matchesStatusFilter(job: any): boolean {
    if (this.statusFilter === 'ALL') return true;
    return job.status === this.statusFilter;
  }

  matchesTypeFilter(job: any): boolean {
    if (this.typeFilter === 'ALL') return true;
    return job.jobType === this.typeFilter;
  }

  matchesSalaryFilter(job: any): boolean {
    if (this.salaryFilter === 'ALL') return true;

    const salary = job.salary || 0;

    switch (this.salaryFilter) {
      case '0-30000':
        return salary < 30000;
      case '30000-50000':
        return salary >= 30000 && salary < 50000;
      case '50000-75000':
        return salary >= 50000 && salary < 75000;
      case '75000-100000':
        return salary >= 75000 && salary < 100000;
      case '100000-150000':
        return salary >= 100000 && salary < 150000;
      case '150000+':
        return salary >= 150000;
      default:
        return true;
    }
  }

  matchesDateFilter(job: any): boolean {
    if (this.dateFilter === 'ALL') return true;

    const jobDate = new Date(job.postedDate);
    const now = new Date();
    const diffTime = now.getTime() - jobDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (this.dateFilter) {
      case 'TODAY':
        return diffDays <= 1;
      case 'WEEK':
        return diffDays <= 7;
      case 'MONTH':
        return diffDays <= 30;
      case '3MONTHS':
        return diffDays <= 90;
      case '6MONTHS':
        return diffDays <= 180;
      default:
        return true;
    }
  }

  matchesClientFilter(job: any): boolean {
    if (this.clientFilter === 'ALL') return true;
    return job.clientName === this.clientFilter;
  }

  matchesManagerFilter(job: any): boolean {
    if (this.managerFilter === 'ALL') return true;
    return job.managerName === this.managerFilter;
  }

  matchesApplicationFilter(job: any): boolean {
    if (this.applicationFilter === 'ALL') return true;

    const appCount = job.applicationsCount || 0;

    switch (this.applicationFilter) {
      case 'NONE':
        return appCount === 0;
      case '1-5':
        return appCount >= 1 && appCount <= 5;
      case '6-10':
        return appCount >= 6 && appCount <= 10;
      case '11+':
        return appCount >= 11;
      default:
        return true;
    }
  }

// Clear filter methods
  clearFilters(): void {
    this.searchText = '';
    this.statusFilter = 'ALL';
    this.typeFilter = 'ALL';
    this.salaryFilter = 'ALL';
    this.dateFilter = 'ALL';
    this.clientFilter = 'ALL';
    this.managerFilter = 'ALL';
    this.applicationFilter = 'ALL';
    this.showAdvancedFilters = false;
    this.applyFilters();
  }

  clearSearchFilter(): void {
    this.searchText = '';
    this.applyFilters();
  }

  clearStatusFilter(): void {
    this.statusFilter = 'ALL';
    this.applyFilters();
  }

  clearTypeFilter(): void {
    this.typeFilter = 'ALL';
    this.applyFilters();
  }

  clearSalaryFilter(): void {
    this.salaryFilter = 'ALL';
    this.applyFilters();
  }

// Helper methods
  hasActiveFilters(): boolean {
    return this.searchText !== '' ||
      this.statusFilter !== 'ALL' ||
      this.typeFilter !== 'ALL' ||
      this.salaryFilter !== 'ALL' ||
      this.dateFilter !== 'ALL' ||
      this.clientFilter !== 'ALL' ||
      this.managerFilter !== 'ALL' ||
      this.applicationFilter !== 'ALL';
  }

  getSalaryFilterLabel(value: string): string {
    const option = this.filterSalaryOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }

// Update your existing loadJobs method to call initializeFilters
  loadJobs(): void {
    this.jobService.getAllJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.initializeFilters(); // Add this line
      },
      error: (error) => {
        this.toastService.error('Error loading jobs', error);
      }
    });
  }

// Update your job list template to use filteredJobs instead of jobs
// Example: *ngFor="let job of filteredJobs" instead of *ngFor="let job of jobs"
}
