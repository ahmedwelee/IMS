import { Component, OnInit } from '@angular/core';
import { ApplicationService } from '../../service/application.service';
import { ApplicationRequest } from '../../service/application-request';
import { ApplicationResponse } from '../../service/application-response';
import { EmployeesService } from '../../service/employee.service';
import { JobService } from '../../service/job.service';
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-applications',
  templateUrl: './application.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ]
})
export class ApplicationsComponent implements OnInit {
  applications: ApplicationResponse[] = [];
  selectedApplication: ApplicationResponse | null = null;
  showModal: boolean = false;
  isEditMode: boolean = false;
  showDecisionModal: boolean = false;
  currentDecision: 'HIRED' | 'REJECTED' | null = null;
  decisionFeedback: string = '';

  currentApplication: ApplicationRequest = {
    applicationName: '',
    appliedDate: new Date().toISOString().split('T')[0],
    updatedDate: new Date().toISOString().split('T')[0],
    status: 'PENDING',
    candidateId: 0,
    jopId: 0
  };

  statusOptions: string[] = ['PENDING', 'REVIEWING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'];
  candidates: any[] = [];
  jobs: any[] = [];

  constructor(
    private applicationService: ApplicationService,
    private employeeService: EmployeesService,
    private jobService: JobService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
    this.loadCandidatesAndJobs();
  }

  // Load all applications
  loadApplications(): void {
    this.applicationService.getAllApplications().subscribe({
      next: (applications) => {
        this.applications = applications;
      },
      error: (error) => {
        console.error('Error loading applications:', error);
      }
    });
  }

  // Load candidates and jobs from database
  loadCandidatesAndJobs(): void {
    // Load candidates (employees who are not managers/directors)
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.candidates = employees.filter(emp =>
          emp.position !== 'MANAGER' && emp.position !== 'DIRECTOR'
        );
      },
      error: (error) => {
        console.error('Error loading candidates:', error);
        this.candidates = [];
      }
    });

    // Load jobs
    this.jobService.getAllJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        this.jobs = [];
      }
    });
  }

  // Get single application
  loadApplication(id: number): void {
    this.applicationService.getApplicationById(id).subscribe({
      next: (application) => {
        this.selectedApplication = application;
      },
      error: (error) => {
        console.error('Error loading application:', error);
      }
    });
  }

  // Open decision modal (accept or reject)
  openDecisionModal(application: ApplicationResponse, decision: 'HIRED' | 'REJECTED'): void {
    this.selectedApplication = application;
    this.currentDecision = decision;
    this.decisionFeedback = '';
    this.showDecisionModal = true;
  }

  // Close decision modal
  closeDecisionModal(): void {
    this.showDecisionModal = false;
    this.currentDecision = null;
    this.decisionFeedback = '';
  }

  // Confirm decision (accept or reject)
  confirmDecision(): void {
    if (!this.selectedApplication || !this.currentDecision) return;

    const updateRequest: ApplicationRequest = {
      applicationName: this.selectedApplication.applicationName,
      appliedDate: this.selectedApplication.appliedDate,
      updatedDate: new Date().toISOString().split('T')[0],
      status: this.currentDecision,
      candidateId: 0,
      jopId: 0
    };

    this.applicationService.updateApplication(this.selectedApplication.id, updateRequest).subscribe({
      next: (updatedApplication) => {
        const index = this.applications.findIndex(a => a.id === updatedApplication.id);
        if (index !== -1) {
          this.applications[index] = updatedApplication;
        }
        if (this.selectedApplication?.id === updatedApplication.id) {
          this.selectedApplication = updatedApplication;
        }

        // Here you could save the feedback to a separate service if needed
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

  // Reset application status to PENDING
  resetApplicationStatus(application: ApplicationResponse): void {
    if (confirm(`Are you sure you want to reset the status of ${application.candidateFullName}'s application?`)) {
      const updateRequest: ApplicationRequest = {
        applicationName: application.applicationName,
        appliedDate: application.appliedDate,
        updatedDate: new Date().toISOString().split('T')[0],
        status: 'PENDING',
        candidateId: 0,
        jopId: 0
      };

      this.applicationService.updateApplication(application.id, updateRequest).subscribe({
        next: (updatedApplication) => {
          const index = this.applications.findIndex(a => a.id === updatedApplication.id);
          if (index !== -1) {
            this.applications[index] = updatedApplication;
          }
          if (this.selectedApplication?.id === application.id) {
            this.selectedApplication = updatedApplication;
          }
        },
        error: (error) => {
          console.error('Error resetting application status:', error);
        }
      });
    }
  }

  // Format date
  formatDate(date: string | undefined): string {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString();
  }

  // Get status badge class
  getStatusBadgeClass(status: string | undefined): string {
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

  // Get decision modal title
  getDecisionModalTitle(): string {
    if (!this.currentDecision || !this.selectedApplication) return '';

    return this.currentDecision === 'HIRED'
      ? `Accept ${this.selectedApplication.candidateFullName}`
      : `Reject ${this.selectedApplication.candidateFullName}`;
  }

  // Get decision modal button text
  getDecisionButtonText(): string {
    return this.currentDecision === 'HIRED' ? 'Accept Candidate' : 'Reject Candidate';
  }

  // Get decision modal button class
  getDecisionButtonClass(): string {
    return this.currentDecision === 'HIRED' ? 'btn-success' : 'btn-danger';
  }
}
