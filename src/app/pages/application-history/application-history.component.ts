import { Component, OnInit } from '@angular/core';
import {ApplicationResponse} from "../../service/application-response";
import {ApplicationService} from "../../service/application.service";
import {ToastrService} from "ngx-toastr";
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {CandidateService} from "../../service/candidate.service";
import {KeycloakService} from "../../service/keycloak.service";

@Component({
  selector: 'app-application-history',
  standalone: true,
  templateUrl: './application-history.component.html',
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./application-history.component.scss']
})
export class ApplicationHistoryComponent implements OnInit {

  applications: ApplicationResponse[] = [];
  filteredApplications: ApplicationResponse[] = [];
  selectedApplication: ApplicationResponse | null = null;

  // Current logged-in candidate info
  currentCandidateId: number = 0;
  currentCandidateName: string = '';
  userProfile: any = null;
  isLoggedIn = false;

  // Modal states
  showDetailsModal: boolean = false;

  // Filter and search
  searchTerm: string = '';
  statusFilter: string = '';

  // Loading states
  isLoading: boolean = false;

  statusOptions: string[] = ['PENDING', 'REVIEWING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'];

  constructor(
    private applicationService: ApplicationService,
    private candidateService: CandidateService,
    private keycloakService: KeycloakService,
    private toastService: ToastrService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.initializeAuth();

    if (this.isLoggedIn) {
      await this.loadCandidateId();
      if (this.currentCandidateId > 0) {
        this.loadMyApplications();
      }
    }
  }

  async initializeAuth(): Promise<void> {
    try {
      this.isLoggedIn = await this.keycloakService.isLoggedIn();

      if (this.isLoggedIn) {
        this.userProfile = await this.keycloakService.loadUserProfile();
        this.currentCandidateName = `${this.userProfile.firstName || ''} ${this.userProfile.lastName || ''}`.trim();
      } else {
        await this.keycloakService.login();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.toastService.error('Authentication error. Please log in again.', 'Error');
    }
  }

  async loadCandidateId(): Promise<void> {
    if (this.userProfile && this.userProfile.email) {
      try {
        const candidate = await this.candidateService.getCandidateByEmail(this.userProfile.email).toPromise();
        this.currentCandidateId = candidate?.id ?? 0;

        if (this.currentCandidateId === 0) {
          this.toastService.error('Unable to identify candidate. Please contact support.', 'Error');
        }
      } catch (error) {
        console.error('Error fetching candidate by email:', error);
        this.toastService.error('Unable to load candidate information', 'Error');
      }
    }
  }

  // Load applications for current candidate
  loadMyApplications(): void {
    this.isLoading = true;

    // Use endpoint to get applications by candidate ID
    this.applicationService.getApplicationsByCandidate(this.currentCandidateId).subscribe({
      next: (applications) => {
        this.applications = applications;

        // Sort by most recent first
        this.applications.sort((a, b) =>
          new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
        );

        this.filteredApplications = this.applications;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.toastService.error('Error loading your applications', 'Error');
        this.isLoading = false;
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
  openDetailsModal(application: ApplicationResponse): void {
    this.selectedApplication = application;
    this.showDetailsModal = true;
  }

  // Close details modal
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedApplication = null;
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

  getStatusIcon(status: string | undefined): string {
    if (!status) return 'fa-question-circle';

    switch (status.toUpperCase()) {
      case 'PENDING': return 'fa-clock';
      case 'REVIEWING': return 'fa-search';
      case 'INTERVIEW': return 'fa-users';
      case 'OFFERED': return 'fa-handshake';
      case 'HIRED': return 'fa-check-circle';
      case 'REJECTED': return 'fa-times-circle';
      default: return 'fa-question-circle';
    }
  }

  getStatusMessage(status: string | undefined): string {
    if (!status) return 'Status unknown';

    switch (status.toUpperCase()) {
      case 'PENDING': return 'Your application is pending review';
      case 'REVIEWING': return 'Your application is under review';
      case 'INTERVIEW': return 'You have been shortlisted for an interview';
      case 'OFFERED': return 'Congratulations! You have received a job offer';
      case 'HIRED': return 'Congratulations! You have been hired';
      case 'REJECTED': return 'Unfortunately, your application was not successful';
      default: return 'Status unknown';
    }
  }

  // Statistics
  getTotalApplications(): number {
    return this.applications.length;
  }

  getPendingApplications(): number {
    return this.applications.filter(app => app.status === 'PENDING').length;
  }

  getActiveApplications(): number {
    return this.applications.filter(app =>
      ['REVIEWING', 'INTERVIEW', 'OFFERED'].includes(app.status || '')
    ).length;
  }

  getHiredApplications(): number {
    return this.applications.filter(app => app.status === 'HIRED').length;
  }

  getRejectedApplications(): number {
    return this.applications.filter(app => app.status === 'REJECTED').length;
  }

  // Calculate days since application
  getDaysSinceApplied(appliedDate: string): number {
    const applied = new Date(appliedDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - applied.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

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
}
