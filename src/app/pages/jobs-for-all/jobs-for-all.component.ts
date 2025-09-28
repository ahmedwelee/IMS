import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {KeycloakService} from "../../service/keycloak.service";
import {JobService} from "../../service/job.service";
import {ClientsService} from "../../service/clients.service";
import {NgForOf, NgIf, SlicePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";



interface SearchFilters {
  keyword: string;
  location: string;
  jobType: string;
  minSalary: number | null;
  maxSalary: number | null;
  selectedTypes: string[];
  selectedExperience: string[];
  selectedCompanies: number[];
  isRemote: boolean;
  isUrgent: boolean;
  isNew: boolean;
}

interface JobType {
  value: string;
  label: string;
}

interface ExperienceLevel {
  value: string;
  label: string;
}

interface Company {
  id: number;
  name: string;
  jobCount?: number;
}
@Component({
  selector: 'app-jobs-for-all',
  standalone: true,
  templateUrl: './jobs-for-all.component.html',
  imports: [
    SlicePipe,
    FormsModule,
    NgIf,
    NgForOf,
  ],
  styleUrls: ['./jobs-for-all.component.scss']
})
export class JobsForAllComponent implements OnInit{


  // Data
  allJobs: any[] = [];
  filteredJobs: any[] = [];
  paginatedJobs: any[] = [];
  topCompanies: Company[] = [];
  selectedJob: any = null;

  // Loading states
  isLoading: boolean = false;
  isLoggedIn: boolean = false;

  // View settings
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: string = 'newest';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 12;
  totalPages: number = 1;

  // Modal states
  showJobModal: boolean = false;

  // Search and filters
  searchFilters: SearchFilters = {
    keyword: '',
    location: '',
    jobType: '',
    minSalary: null,
    maxSalary: null,
    selectedTypes: [],
    selectedExperience: [],
    selectedCompanies: [],
    isRemote: false,
    isUrgent: false,
    isNew: false
  };

  jobTypes: JobType[] = [
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'REMOTE', label: 'Remote' },
    { value: 'INTERNSHIP', label: 'Internship' }
  ];

  experienceLevels: ExperienceLevel[] = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior Level (6+ years)' },
    { value: 'executive', label: 'Executive Level' }
  ];

  // For Math functions in template
  Math = Math;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private keycloakService: KeycloakService,
    private jobService: JobService,
    private clientsService: ClientsService
  ) {}

  async ngOnInit(): Promise<void> {
    this.isLoggedIn = await this.keycloakService.isLoggedIn();
    this.loadJobs();
    this.loadTopCompanies();
    this.handleRouteParams();
  }

  handleRouteParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['keyword']) {
        this.searchFilters.keyword = params['keyword'];
        this.applyFilters();
      }
      if (params['location']) {
        this.searchFilters.location = params['location'];
        this.applyFilters();
      }
      if (params['type']) {
        this.searchFilters.jobType = params['type'];
        this.applyFilters();
      }
    });
  }

  // Data Loading
  loadJobs(): void {
    this.isLoading = true;
    this.jobService.openJobsGetAll().subscribe({
      next: (jobs) => {
        this.allJobs = jobs;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        this.allJobs = this.getDemoJobs();
        this.applyFilters();
        this.isLoading = false;
      }
    });
  }

  loadTopCompanies(): void {
    this.clientsService.getAllClients().subscribe({
      next: (clients) => {
        this.topCompanies = clients.slice(0, 10).map(client => ({
          id: client.id,
          name: client.name,
          jobCount: this.getJobsCount(client.jobsCount)
        }));
      },
      error: (error) => {
        console.error('Error loading companies:', error);
        this.topCompanies = this.getDemoCompanies();
      }
    });
  }

  // Search and Filtering
  searchJobs(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allJobs];

    // Keyword filter
    if (this.searchFilters.keyword) {
      const keyword = this.searchFilters.keyword.toLowerCase();
      filtered = filtered.filter(job =>
        job.jopName?.toLowerCase().includes(keyword) ||
        job.description?.toLowerCase().includes(keyword) ||
        job.clientName?.toLowerCase().includes(keyword)
      );
    }

    // Location filter
    if (this.searchFilters.location) {
      const location = this.searchFilters.location.toLowerCase();
      filtered = filtered.filter(job =>
        job.location?.toLowerCase().includes(location)
      );
    }

    // Job type filter
    if (this.searchFilters.jobType) {
      filtered = filtered.filter(job => job.jobType === this.searchFilters.jobType);
    }

    // Salary range filter
    if (this.searchFilters.minSalary) {
      filtered = filtered.filter(job => job.salary >= this.searchFilters.minSalary!);
    }
    if (this.searchFilters.maxSalary) {
      filtered = filtered.filter(job => job.salary <= this.searchFilters.maxSalary!);
    }

    // Multiple job types filter
    if (this.searchFilters.selectedTypes.length > 0) {
      filtered = filtered.filter(job =>
        this.searchFilters.selectedTypes.includes(job.jobType)
      );
    }

    // Company filter
    if (this.searchFilters.selectedCompanies.length > 0) {
      filtered = filtered.filter(job =>
        this.searchFilters.selectedCompanies.includes(job.clientId)
      );
    }

    // Remote filter
    if (this.searchFilters.isRemote) {
      filtered = filtered.filter(job =>
        job.jobType === 'REMOTE' || job.location?.toLowerCase().includes('remote')
      );
    }

    // New jobs filter (posted in last 7 days)
    if (this.searchFilters.isNew) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(job =>
        new Date(job.postedDate) > oneWeekAgo
      );
    }

    this.filteredJobs = this.sortJobs(filtered);
    this.updatePagination();
  }

  sortJobs(jobs: any[]): any[] {
    return jobs.sort((a, b) => {
      switch (this.sortBy) {
        case 'newest':
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        case 'salary_high':
          return b.salary - a.salary;
        case 'salary_low':
          return a.salary - b.salary;
        case 'relevance':
          // Simple relevance based on keyword match in title
          if (this.searchFilters.keyword) {
            const keyword = this.searchFilters.keyword.toLowerCase();
            const aRelevance = (a.jopName?.toLowerCase().includes(keyword) ? 2 : 0) +
              (a.description?.toLowerCase().includes(keyword) ? 1 : 0);
            const bRelevance = (b.jopName?.toLowerCase().includes(keyword) ? 2 : 0) +
              (b.description?.toLowerCase().includes(keyword) ? 1 : 0);
            return bRelevance - aRelevance;
          }
          return 0;
        default:
          return 0;
      }
    });
  }

  // Filter Toggle Methods
  toggleJobType(type: string): void {
    const index = this.searchFilters.selectedTypes.indexOf(type);
    if (index > -1) {
      this.searchFilters.selectedTypes.splice(index, 1);
    } else {
      this.searchFilters.selectedTypes.push(type);
    }
    this.currentPage = 1;
    this.applyFilters();
  }

  toggleExperience(level: string): void {
    const index = this.searchFilters.selectedExperience.indexOf(level);
    if (index > -1) {
      this.searchFilters.selectedExperience.splice(index, 1);
    } else {
      this.searchFilters.selectedExperience.push(level);
    }
    this.currentPage = 1;
    this.applyFilters();
  }

  toggleCompany(companyId: number): void {
    const index = this.searchFilters.selectedCompanies.indexOf(companyId);
    if (index > -1) {
      this.searchFilters.selectedCompanies.splice(index, 1);
    } else {
      this.searchFilters.selectedCompanies.push(companyId);
    }
    this.currentPage = 1;
    this.applyFilters();
  }

  toggleRemoteFilter(): void {
    this.searchFilters.isRemote = !this.searchFilters.isRemote;
    this.currentPage = 1;
    this.applyFilters();
  }

  toggleUrgentFilter(): void {
    this.searchFilters.isUrgent = !this.searchFilters.isUrgent;
    this.currentPage = 1;
    this.applyFilters();
  }

  toggleNewFilter(): void {
    this.searchFilters.isNew = !this.searchFilters.isNew;
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchFilters = {
      keyword: '',
      location: '',
      jobType: '',
      minSalary: null,
      maxSalary: null,
      selectedTypes: [],
      selectedExperience: [],
      selectedCompanies: [],
      isRemote: false,
      isUrgent: false,
      isNew: false
    };
    this.currentPage = 1;
    this.applyFilters();
  }

  // Pagination
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredJobs.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    this.updatePaginatedJobs();
  }

  updatePaginatedJobs(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedJobs = this.filteredJobs.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedJobs();
      window.scrollTo(0, 0);
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, this.currentPage - halfVisible);
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  // View Controls
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  setSortBy(sortBy: string): void {
    this.sortBy = sortBy;
    this.filteredJobs = this.sortJobs([...this.filteredJobs]);
    this.updatePaginatedJobs();
  }

  getSortLabel(): string {
    switch (this.sortBy) {
      case 'newest': return 'Newest First';
      case 'salary_high': return 'Highest Salary';
      case 'salary_low': return 'Lowest Salary';
      case 'relevance': return 'Most Relevant';
      default: return 'Newest First';
    }
  }

  // Job Actions
  viewJobDetails(job: any): void {
    this.selectedJob = job;
    this.showJobModal = true;
  }

  closeJobModal(): void {
    this.showJobModal = false;
    this.selectedJob = null;
  }

  async applyToJob(job: any): Promise<void> {
    if (!this.isLoggedIn) {
      await this.keycloakService.login();
      return;
    }

    // Navigate to application form
    this.router.navigate(['/apply'], {
      queryParams: { jobId: job.id }
    });
  }

  async saveJob(job: any): Promise<void> {
    if (!this.isLoggedIn) {
      await this.keycloakService.login();
      return;
    }

    // Implement save job functionality
    console.log('Saving job:', job);
  }

  // Utility Methods
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

  getJobTypeDisplay(jobType: string | undefined): string {
    if (!jobType) return 'Unknown';

    const typeMap: { [key: string]: string } = {
      'FULL_TIME': 'Full Time',
      'PART_TIME': 'Part Time',
      'CONTRACT': 'Contract',
      'REMOTE': 'Remote',
      'INTERNSHIP': 'Internship'
    };

    return typeMap[jobType] || jobType;
  }

  formatSalary(salary: number | undefined): string {
    if (!salary) return '0';
    return salary.toLocaleString('en-US');
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const jobDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - jobDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  }

  getJobsCount(jobsCount: number | number[] | undefined): number {
    if (typeof jobsCount === 'number') {
      return jobsCount;
    } else if (Array.isArray(jobsCount)) {
      return jobsCount.length;
    }
    return 0;
  }

  // Demo Data
  getDemoJobs(): any[] {
    return [
      {
        id: 1,
        jopName: 'Senior Frontend Developer',
        clientName: 'TechCorp Inc.',
        clientId: 1,
        location: 'San Francisco, CA',
        description: 'We are looking for an experienced frontend developer to join our dynamic team. You will be responsible for building user-friendly web applications using modern technologies like React, Angular, and Vue.js.',
        jobType: 'FULL_TIME',
        salary: 120000,
        postedDate: new Date('2024-01-15'),
        applicationsCount: 25,
        status: 'OPEN'
      },
      {
        id: 2,
        jopName: 'Marketing Manager',
        clientName: 'Growth Solutions',
        clientId: 2,
        location: 'New York, NY',
        description: 'Join our marketing team to develop and execute comprehensive marketing strategies. Perfect opportunity for a creative professional with strong analytical skills.',
        jobType: 'FULL_TIME',
        salary: 85000,
        postedDate: new Date('2024-01-12'),
        applicationsCount: 18,
        status: 'OPEN'
      },
      {
        id: 3,
        jopName: 'UX/UI Designer',
        clientName: 'Design Studio Pro',
        clientId: 3,
        location: 'Remote',
        description: 'We need a talented designer to create beautiful and intuitive user experiences. Work with a collaborative team on exciting projects for diverse clients.',
        jobType: 'REMOTE',
        salary: 75000,
        postedDate: new Date('2024-01-10'),
        applicationsCount: 32,
        status: 'OPEN'
      },
      {
        id: 4,
        jopName: 'Data Scientist',
        clientName: 'Analytics Corp',
        clientId: 4,
        location: 'Seattle, WA',
        description: 'Looking for a data scientist with strong Python and machine learning skills. Work on cutting-edge AI projects and help drive business decisions.',
        jobType: 'FULL_TIME',
        salary: 130000,
        postedDate: new Date('2024-01-08'),
        applicationsCount: 15,
        status: 'OPEN'
      },
      {
        id: 5,
        jopName: 'DevOps Engineer',
        clientName: 'Cloud Solutions Inc',
        clientId: 5,
        location: 'Austin, TX',
        description: 'Join our infrastructure team to build and maintain scalable cloud solutions. Experience with AWS, Docker, and Kubernetes required.',
        jobType: 'FULL_TIME',
        salary: 110000,
        postedDate: new Date('2024-01-05'),
        applicationsCount: 22,
        status: 'OPEN'
      }
    ];
  }

  getDemoCompanies(): Company[] {
    return [
      { id: 1, name: 'TechCorp Inc.', jobCount: 12 },
      { id: 2, name: 'Growth Solutions', jobCount: 8 },
      { id: 3, name: 'Design Studio Pro', jobCount: 5 },
      { id: 4, name: 'Analytics Corp', jobCount: 7 },
      { id: 5, name: 'Cloud Solutions Inc', jobCount: 10 }
    ];
  }

}
