import { Component, OnInit } from '@angular/core';
import { ApplicationService } from '../../service/application.service';
import { EmployeesService } from '../../service/employee.service';
import { JobService } from '../../service/job.service';
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf, UpperCasePipe} from "@angular/common";
import { ToastrService } from 'ngx-toastr';
import { ApplicationResponse } from 'src/app/service/application-response';
import {ApplicationRequest} from "../../service/application-request";



@Component({
  selector: 'app-applications',
  templateUrl: './application.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    UpperCasePipe
  ]
})
export class ApplicationsComponent implements OnInit {

  applications: ApplicationResponse[] = [];
  filteredApplications: ApplicationResponse[] = [];
  selectedApplication: ApplicationResponse | null = null;

  // Modal states
  showDecisionModal: boolean = false;
  showApplicationDetailsModal: boolean = false;

  // Decision handling
  currentDecision: 'HIRED' | 'REJECTED' | null = null;
  decisionFeedback: string = '';

  // Filter and search
  searchTerm: string = '';
  statusFilter: string = '';

  // Loading states
  isLoading: boolean = false;

  currentApplication: ApplicationRequest = {
    appliedDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    status: 'PENDING',
    candidateId: 0,
    jopId: 0,
    firstname: '',
    lastname: '',
    phoneNumber: '',
    address: '',
    nationality: '',
    gender: '',
    dateOfBirth: '',
    cvPath: ''
  };

  statusOptions: string[] = ['PENDING', 'REVIEWING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'];
  candidates: any[] = [];
  jobs: any[] = [];

  constructor(
    private applicationService: ApplicationService,
    private employeeService: EmployeesService,
    private jobService: JobService,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
    this.loadCandidatesAndJobs();
  }

  // Load all applications
  loadApplications(): void {
    this.isLoading = true;
    this.applicationService.getAllApplications().subscribe({
      next: (applications) => {
        this.applications = applications;
        this.filteredApplications = applications;
        this.isLoading = false;

        // Log first application to verify structure
        if (applications.length > 0) {
          console.log('Application structure:', applications[0]);
        }
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.toastService.error('Error loading applications', 'Error');
        this.isLoading = false;
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
        console.error('Error loading employees:', error);
        this.toastService.error(error.error?.error || 'Failed to load candidates', 'Error');
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
        this.toastService.error(error.error?.error || 'Failed to load jobs', 'Error');
        this.jobs = [];
      }
    });
  }

  // Search and filter applications
  applyFilters(): void {
    let filtered = [...this.applications];

    // Search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        (app.candidateFullName?.toLowerCase().includes(searchLower) || false) ||
        (app.jopName?.toLowerCase().includes(searchLower) || false)
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(app => app.status === this.statusFilter);
    }

    this.filteredApplications = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.filteredApplications = [...this.applications];
  }

  // Open application details modal
  openApplicationDetailsModal(application: ApplicationResponse): void {
    this.selectedApplication = application;
    this.showApplicationDetailsModal = true;
  }

  // Close application details modal
  closeApplicationDetailsModal(): void {
    this.showApplicationDetailsModal = false;
    this.selectedApplication = null;
  }

  // Open decision modal (accept or reject)
  openDecisionModal(application: ApplicationResponse, decision: 'HIRED' | 'REJECTED'): void {
    this.selectedApplication = application;
    this.currentDecision = decision;
    this.decisionFeedback = '';
    this.showDecisionModal = true;

    // Close application details modal if open
    if (this.showApplicationDetailsModal) {
      this.showApplicationDetailsModal = false;
    }
  }

  // Close decision modal
  closeDecisionModal(): void {
    this.showDecisionModal = false;
    this.currentDecision = null;
    this.decisionFeedback = '';
    this.selectedApplication = null;
  }

  // Confirm decision (accept or reject) - MAIN ACCEPT/REJECT LOGIC
  confirmDecision(): void {
    if (!this.selectedApplication || !this.currentDecision) {
      this.toastService.warning('Please select an application and decision', 'Warning');
      return;
    }

    // Get jobId from response (backend returns "jobId")
    const jobId = this.selectedApplication.jobId;

    if (!jobId || jobId === 0) {
      this.toastService.error('Job ID is missing. Cannot update application.', 'Error');
      console.error('Missing jobId in application:', this.selectedApplication);
      return;
    }

    // Create update request - backend expects "jopId" in the request
    const updateRequest: ApplicationRequest = {
      appliedDate: this.selectedApplication.appliedDate || new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString(),
      status: this.currentDecision,
      candidateId: this.selectedApplication.candidateId || 0,
      jopId: jobId,  // Map jobId from response to jopId for request
      firstname: this.selectedApplication.firstname || '',
      lastname: this.selectedApplication.lastname || '',
      phoneNumber: this.selectedApplication.phoneNumber || '',
      address: this.selectedApplication.address || '',
      nationality: this.selectedApplication.nationality || '',
      gender: this.selectedApplication.gender || '',
      dateOfBirth: this.selectedApplication.dateOfBirth || '',
      cvPath: this.selectedApplication.cvPath || ''
    };

    console.log('Sending update request:', updateRequest);

    // Update application status
    this.applicationService.updateApplication(this.selectedApplication.id, updateRequest).subscribe({
      next: (updatedApplication) => {
        // Update local data
        const index = this.applications.findIndex(a => a.id === updatedApplication.id);
        if (index !== -1) {
          this.applications[index] = updatedApplication;
        }

        this.applyFilters(); // Reapply filters after update

        // Log feedback if provided
        if (this.decisionFeedback) {
          console.log(`Decision feedback for application ${updatedApplication.id}:`, this.decisionFeedback);
        }

        // Show success message
        const action = this.currentDecision === 'HIRED' ? 'accepted' : 'rejected';
        const candidateName = this.getCandidateName(updatedApplication);
        this.toastService.success(
          `${candidateName}'s application has been ${action} successfully`,
          'Success'
        );

        this.closeDecisionModal();
      },
      error: (error) => {
        console.error('Error updating application:', error);
        console.error('Error details:', error.error);
        this.toastService.error(
          error.error?.error || 'Failed to update application status',
          'Error'
        );
      }
    });
  }

  // Reset application status to PENDING
  resetApplicationStatus(application: ApplicationResponse): void {
    const candidateName = this.getCandidateName(application);

    if (confirm(`Are you sure you want to reset ${candidateName}'s application status to PENDING?`)) {
      // Get jobId from response (backend returns "jobId")
      const jobId = application.jobId;

      if (!jobId || jobId === 0) {
        this.toastService.error('Job ID is missing. Cannot reset application.', 'Error');
        console.error('Missing jobId in application:', application);
        return;
      }

      const updateRequest: ApplicationRequest = {
        appliedDate: application.appliedDate || new Date().toISOString().split('T')[0],
        updatedDate: new Date().toISOString(),
        status: 'PENDING',
        candidateId: application.candidateId || 0,
        jopId: jobId,  // Map jobId from response to jopId for request
        firstname: application.firstname || '',
        lastname: application.lastname || '',
        phoneNumber: application.phoneNumber || '',
        address: application.address || '',
        nationality: application.nationality || '',
        gender: application.gender || '',
        dateOfBirth: application.dateOfBirth || '',
        cvPath: application.cvPath || ''
      };

      console.log('Sending reset request:', updateRequest);

      this.applicationService.updateApplication(application.id, updateRequest).subscribe({
        next: (updatedApplication) => {
          const index = this.applications.findIndex(a => a.id === updatedApplication.id);
          if (index !== -1) {
            this.applications[index] = updatedApplication;
          }

          this.applyFilters();
          this.toastService.success(
            `${candidateName}'s application status has been reset to PENDING`,
            'Success'
          );
        },
        error: (error) => {
          console.error('Error resetting application:', error);
          console.error('Error details:', error.error);
          this.toastService.error(
            error.error?.error || 'Failed to reset application status',
            'Error'
          );
        }
      });
    }
  }

  // Download/View CV file
  viewCV(applicationId: number): void {
    if (!applicationId) {
      this.toastService.warning('Invalid application ID', 'Warning');
      return;
    }

    this.toastService.info('Loading CV...', 'Please wait');

    this.applicationService.getApplicationCv(applicationId).subscribe({
      next: (blob: Blob) => {
        // Create a blob URL and open it in a new tab
        const blobUrl = window.URL.createObjectURL(blob);
        const newWindow = window.open(blobUrl, '_blank');

        if (!newWindow) {
          // If popup was blocked, download the file instead
          this.downloadCvFile(blob, applicationId);
          this.toastService.warning('Popup blocked. CV downloaded instead.', 'Info');
        } else {
          this.toastService.success('CV opened in new tab', 'Success');

          // Clean up the blob URL after a delay
          setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
          }, 100);
        }
      },
      error: (error) => {
        console.error('Error fetching CV:', error);
        if (error.status === 404) {
          this.toastService.error('CV file not found for this application', 'Not Found');
        } else {
          this.toastService.error('Failed to load CV. Please try again.', 'Error');
        }
      }
    });
  }

  // Helper method to download CV file if viewing fails
  private downloadCvFile(blob: Blob, applicationId: number): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cv_application_${applicationId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Legacy method for backward compatibility (if cvPath is a direct URL)
  downloadCV(cvPath: string): void {
    if (!cvPath) {
      this.toastService.warning('No CV file available for this application', 'Warning');
      return;
    }

    try {
      // If cvPath is a full URL, open it directly
      if (cvPath.startsWith('http://') || cvPath.startsWith('https://')) {
        window.open(cvPath, '_blank');
        this.toastService.info('Opening CV...', 'Info');
      } else {
        this.toastService.warning('Invalid CV path', 'Warning');
      }
    } catch (error) {
      console.error('Error opening CV:', error);
      this.toastService.error('Failed to open CV', 'Error');
    }
  }

  // Utility methods
  formatDate(date: string | undefined): string {
    if (!date) return 'Unknown date';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  }

  getStatusBadgeClass(status: string | undefined): string {
    if (!status) return 'bg-secondary';

    switch (status.toUpperCase()) {
      case 'PENDING': return 'bg-warning text-dark';
      case 'REVIEWING': return 'bg-info';
      case 'INTERVIEW': return 'bg-primary';
      case 'OFFERED': return 'bg-success';
      case 'HIRED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getDecisionModalTitle(): string {
    if (!this.currentDecision || !this.selectedApplication) return '';

    const action = this.currentDecision === 'HIRED' ? 'Accept' : 'Reject';
    const candidateName = this.getCandidateName(this.selectedApplication);
    return `${action} ${candidateName}`;
  }

  getDecisionButtonText(): string {
    return this.currentDecision === 'HIRED' ? 'Accept Candidate' : 'Reject Candidate';
  }

  getDecisionButtonClass(): string {
    return this.currentDecision === 'HIRED' ? 'btn-success' : 'btn-danger';
  }

  // Statistics
  getApplicationsByStatus(status: string): number {
    return this.applications.filter(app => app.status === status).length;
  }

  getTotalApplications(): number {
    return this.applications.length;
  }

  getPendingApplications(): number {
    return this.getApplicationsByStatus('PENDING');
  }

  getHiredApplications(): number {
    return this.getApplicationsByStatus('HIRED');
  }

  getRejectedApplications(): number {
    return this.getApplicationsByStatus('REJECTED');
  }

  // Get candidate name for display
  getCandidateName(application: ApplicationResponse): string {
    return application.candidateFullName || 'Unknown Candidate';
  }

  // Get job title for display
  getJobTitle(application: ApplicationResponse): string {
    return application.jopName || 'Unknown Job';
  }
}
