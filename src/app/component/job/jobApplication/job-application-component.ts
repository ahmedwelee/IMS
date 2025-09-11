import {Component, OnInit} from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import {CommonModule, DatePipe, Location} from '@angular/common';
import {JobService} from "../../../service/job.service";
import {ApplicationService} from "../../../service/application.service";

@Component({
  selector: 'app-job-applications',
  templateUrl: './job-application-component.html',
  standalone: true,
  imports: [
    DatePipe,
  CommonModule]
})
export class JobApplicationsComponent implements OnInit {
  jobId!: number;
  job: any = null; // Initialize as null
  applications: any[] = [];
  showDecisionModal = false;
  selectedApplication: any = null; // Initialize as null
  currentDecision: 'HIRED' | 'REJECTED' | null = null;
  decisionFeedback: string = '';
  // For UI display
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

  applicationStatusOptions: any[] = [
    {label: 'Pending', value: 'PENDING'},
    {label: 'Reviewing', value: 'REVIEWING'},
    {label: 'Interview', value: 'INTERVIEW'},
    {label: 'Offered', value: 'OFFERED'},
    {label: 'Hired', value: 'HIRED'},
    {label: 'Rejected', value: 'REJECTED'}
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private jobService: JobService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.jobId = +idParam;
      this.loadJobDetails();
      this.loadApplications();
    } else {
      console.error('No job ID found in route parameters');
    }
  }

  loadJobDetails(): void {
    this.jobService.getJobById(this.jobId).subscribe({
      next: (job) => {
        this.job = job;
      },
      error: (error) => {
        console.error('Error loading job:', error);
      }
    });
  }

  loadApplications(): void {
    this.applicationService.getApplicationsByJob(this.jobId).subscribe({
      next: (applications) => {
        this.applications = applications;
      },
      error: (error) => {
        console.error('Error loading applications:', error);
      }
    });
  }

  getApplicationCount(status: string): number {
    return this.applications.filter(app => app.status === status).length;
  }

  // Copy all the helper methods from JobsComponent
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
    const type = this.jobTypes.find(t => t.value === jobType);
    return type ? type.label : jobType;
  }

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

  getStatusDisplay(status: string | undefined): string {
    if (!status) return 'Unknown';
    const statusObj = this.statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  formatSalary(salary: number | undefined): string {
    if (!salary) return '0';
    return salary.toLocaleString('en-US');
  }

  getApplicationStatusBadgeClass(status: string | undefined): string {
    if (!status) return 'bg-secondary';
    switch (status) {
      case 'PENDING': return 'bg-warning text-dark';
      case 'REVIEWING': return 'bg-info';
      case 'INTERVIEW': return 'bg-primary';
      case 'OFFERED': return 'bg-success';
      case 'HIRED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getApplicationStatusDisplay(status: string | undefined): string {
    if (!status) return 'Unknown';
    const statusObj = this.applicationStatusOptions.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  openDecisionModal(application: any, decision: 'HIRED' | 'REJECTED'): void {
    this.selectedApplication = application;
    this.currentDecision = decision;
    this.decisionFeedback = '';
    this.showDecisionModal = true;
  }

  closeDecisionModal(): void {
    this.showDecisionModal = false;
    this.selectedApplication = null;
    this.currentDecision = null;
    this.decisionFeedback = '';
  }

  confirmDecision(): void {
    if (!this.selectedApplication || !this.currentDecision) return;

    const updateRequest: any = {
      status: this.currentDecision,
      updatedDate: new Date().toISOString().split('T')[0]
    };

    this.applicationService.updateApplication(this.selectedApplication.id, updateRequest).subscribe({
      next: (updatedApplication) => {
        const index = this.applications.findIndex(a => a.id === updatedApplication.id);
        if (index !== -1) {
          this.applications[index] = updatedApplication;
        }

        if (this.decisionFeedback) {
          console.log('Decision feedback:', this.decisionFeedback);
        }

        this.closeDecisionModal();
      },
      error: (error) => {
        console.error('Error updating application:', error);
        this.closeDecisionModal();
      }
    });
  }

  resetApplicationStatus(application: any): void {
    if (confirm(`Are you sure you want to reset the status of ${application.candidateFullName}'s application?`)) {
      const updateRequest: any = {
        status: 'PENDING',
        updatedDate: new Date().toISOString().split('T')[0]
      };

      this.applicationService.updateApplication(application.id, updateRequest).subscribe({
        next: (updatedApplication) => {
          const index = this.applications.findIndex(a => a.id === updatedApplication.id);
          if (index !== -1) {
            this.applications[index] = updatedApplication;
          }
        },
        error: (error) => {
          console.error('Error resetting application status:', error);
        }
      });
    }
  }

  getDecisionModalTitle(): string {
    if (!this.currentDecision || !this.selectedApplication) return '';
    return this.currentDecision === 'HIRED'
      ? `Accept ${this.selectedApplication.candidateFullName}`
      : `Reject ${this.selectedApplication.candidateFullName}`;
  }

  getDecisionButtonText(): string {
    return this.currentDecision === 'HIRED' ? 'Accept Candidate' : 'Reject Candidate';
  }

  getDecisionButtonClass(): string {
    return this.currentDecision === 'HIRED' ? 'btn-success' : 'btn-danger';
  }

  goBack(): void {
    this.location.back();
  }
}
