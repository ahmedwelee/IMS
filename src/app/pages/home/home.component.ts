import {Component, HostListener, OnInit} from '@angular/core';
import {KeycloakService} from "../../service/keycloak.service";
import {Router, RouterLink} from "@angular/router";
import {JobService} from "../../service/job.service";
import {ClientsService} from "../../service/clients.service";
// @ts-ignore
import {UserProfile} from "../../service/user-profile";
import {ApplicationService} from "../../service/application.service";
import {FormsModule} from "@angular/forms";
import {DatePipe, NgForOf, NgIf, SlicePipe} from "@angular/common";
// @ts-ignore
import {KeycloakProfile} from "keycloak-js";
import {NgbDropdown} from "@ng-bootstrap/ng-bootstrap";


interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  role?: string;
  bio?: string;
  avatar?: string;
  applicationsCount?: number;
  profileViews?: number;
  savedJobs?: number;
  roles?: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [
    FormsModule,
    DatePipe,
    SlicePipe,
    NgIf,
    RouterLink,
    NgForOf
  ],
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // Authentication & Profile
  isLoggedIn: boolean = false;
  userProfile: UserProfile = {};
  keycloakProfile: KeycloakProfile | null = null;
  userRoles: string[] = [];

  // Modal states
  showProfile: boolean = false;
  showAbout: boolean = false;
  showPrivacy: boolean = false;
  showTerms: boolean = false;
  showHelp: boolean = false;

  // Navbar UI state
  isNavbarCollapsed: boolean = true;
  isProfileDropdownOpen: boolean = false;

  // Data
  featuredJobs: any[] = [];
  loadingJobs: boolean = false;
  totalJobs: number = 0;
  totalClients: number = 0;
  totalApplications: number = 0;

  // Newsletter
  newsletterEmail: string = '';

  constructor(
    private router: Router,
    private keycloakService: KeycloakService,
    private jobService: JobService,
    private clientsService: ClientsService,
    private applicationService: ApplicationService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.initializeAuth();
    this.loadFeaturedJobs();
    this.loadStatistics();
    if (this.keycloakService.isCandidate()) {
      // get candidate information in candidate service

    }
  }

  // Keycloak Authentication Methods
  async initializeAuth(): Promise<void> {
    try {
      this.isLoggedIn = await this.keycloakService.isLoggedIn();

      if (this.isLoggedIn) {
        await this.loadKeycloakProfile();
        this.loadUserRoles();
        this.buildUserProfile();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  async loadKeycloakProfile(): Promise<void> {
    try {
      this.keycloakProfile = await this.keycloakService.loadUserProfile();
    } catch (error) {
      console.error('Error loading Keycloak profile:', error);
    }
  }

  loadUserRoles(): void {
    try {
      // Get realm roles
      const realmRoles = this.keycloakService.getUserRoles();
      this.userRoles = realmRoles;
    } catch (error) {
      console.error('Error loading user roles:', error);
    }
  }

  buildUserProfile(): void {
    if (this.keycloakProfile) {
      this.userProfile = {
        id: this.keycloakProfile.id,
        username: this.keycloakProfile.username,
        email: this.keycloakProfile.email,
        firstName: this.keycloakProfile.firstName,
        lastName: this.keycloakProfile.lastName,
        name: this.getDisplayName(),
        roles: this.userRoles,
        role: this.getPrimaryRole(),
        // These would come from your application's user service
        applicationsCount: 0,
        profileViews: 0,
        savedJobs: 0
      };

      // Load additional profile data from your backend if needed
      this.loadAdditionalProfileData();
    }
  }

  getDisplayName(): string {
    if (!this.keycloakProfile) return 'User';

    const firstName = this.keycloakProfile.firstName || '';
    const lastName = this.keycloakProfile.lastName || '';

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (this.keycloakProfile.username) {
      return this.keycloakProfile.username;
    } else {
      return 'User';
    }
  }

  getPrimaryRole(): string {
    if (this.userRoles.includes('admin')) return 'Admin';
    if (this.userRoles.includes('Director')) return 'Director';
    if (this.userRoles.includes('Manager')) return 'Manager';
    if (this.userRoles.includes('Candidate')) return 'Candidate';
    if (this.userRoles.includes('employer')) return 'Employer';
    if (this.userRoles.includes('recruiter')) return 'Recruiter';
    return 'Candidate';
  }

  loadAdditionalProfileData(): void {
    // Load additional user data from your backend using the user ID
    const userId = this.keycloakProfile?.id;
    if (userId) {
      // Example: Load user's application count
      // this.applicationService.getUserApplicationCount(userId).subscribe(count => {
      //   this.userProfile.applicationsCount = count;
      // });
    }
  }

  // Authentication Actions
  async login(): Promise<void> {
    try {
      await this.keycloakService.login();
    } catch (error) {
      console.error('Login failed:', error);
    }
    console.log('Login successful');
  }

  async logout(): Promise<void> {
    try {
      await this.keycloakService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  async register(): Promise<void> {
    try {
      await this.keycloakService.register({
        redirectUri: window.location.origin
      });
    } catch (error) {
      console.error('Registration failed:', error);
    }
  }

  // Profile Management
  async updateProfile(): Promise<void> {
    try {
      // Update application-specific profile data through your backend
      // await this.userService.updateUserProfile(this.userProfile);

      this.showProfile = false;
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }

  // Navigation based on roles
  navigateToDashboard(): void {
    if (this.isDirector()) {
      this.router.navigate(['/dashboard']);
    } else if (this.isManager()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // Role checking methods
  hasRole(role: string): boolean {
    return this.userRoles.includes(role);
  }

  canPostJobs(): boolean {
    return this.hasRole('Director') || this.hasRole('Manager') || this.hasRole('employer');
  }

  isDirector(): boolean {
    return this.keycloakService.getUserRoles().includes('Director');
  }

  isManager(): boolean {
    return this.keycloakService.getUserRoles()?.includes('Manager');
  }

  canAccessClients(): boolean {
    return this.isDirector() || this.isManager();
  }

  canAccessAdmin(): boolean {
    return this.hasRole('Director') || this.isDirector();
  }

  // Data Loading Methods
  loadFeaturedJobs(): void {
    this.loadingJobs = true;
    this.jobService.openJobsGetAll().subscribe({
      next: (jobs) => {
        // Get only first 3 jobs for featured section
        this.featuredJobs = jobs.slice(0, 3);
        this.loadingJobs = false;
      },
      error: (error) => {
        console.error('Error loading featured jobs:', error);
        this.loadingJobs = false;
        this.featuredJobs = this.getDemoJobs();
      }
    });
  }

  loadStatistics(): void {
    // Load total jobs
    this.jobService.openJobsGetAll().subscribe({
      next: (jobs) => {
        this.totalJobs = jobs.length;
      },
      error: (error) => {
        console.error('Error loading jobs count:', error);
        this.totalJobs = 150;
      }
    });


    // Load total applications
    if (this.applicationService && this.applicationService.getAllApplications) {
      this.applicationService.getAllApplications().subscribe({
        next: (applications) => {
          this.totalApplications = applications.length;
        },
        error: (error) => {
          console.error('Error loading applications count:', error);
          this.totalApplications = 500;
        }
      });
    } else {
      this.totalApplications = 500;
    }
  }

  // Job Actions
  viewJobDetails(job: any): void {
    this.router.navigate(['/jobs', job.id]);
  }

  async applyToJob(job: any): Promise<void> {
    if (!this.isLoggedIn) {
      await this.login();
      return;
    }

    // Navigate to application form
    this.router.navigate(['/apply'], {
      queryParams: { jobId: job.id }
    });
  }



  // Navigation methods
  toJobs(): void {
    this.router.navigate(['/all-jobs']);
  }

  toClients(): void {
    if (this.canAccessClients()) {
      this.router.navigate(['/clients']);
    }
  }

  toDashboard(): void {
    this.navigateToDashboard();
  }

  // Newsletter
  subscribeNewsletter(): void {
    if (!this.newsletterEmail) return;

    console.log('Subscribing email:', this.newsletterEmail);
    // Add actual newsletter subscription logic here
    // this.newsletterService.subscribe(this.newsletterEmail).subscribe(...)

    this.newsletterEmail = '';
    // Show success message
    // this.showSuccessMessage('Successfully subscribed to newsletter!');
  }

  // Modal control methods
  openProfile(): void {
    this.showProfile = true;
  }

  closeProfile(): void {
    this.showProfile = false;
  }

  openAbout(): void {
    this.showAbout = true;
  }

  closeAbout(): void {
    this.showAbout = false;
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

  // User profile helpers
  getUserInitials(): string {
    const name = this.getDisplayName();
    if (name.includes(' ')) {
      const parts = name.split(' ');
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  // Demo Data (fallback when API fails)
  getDemoJobs(): any[] {
    return [
      {
        id: 1,
        jopName: 'Senior Frontend Developer',
        clientName: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        description: 'We are looking for an experienced frontend developer to join our dynamic team. You will be responsible for building user-friendly web applications using modern technologies.',
        jobType: 'FULL_TIME',
        salary: 120000,
        postedDate: new Date('2024-01-15'),
        applicationsCount: 25
      },
      {
        id: 2,
        jopName: 'Marketing Manager',
        clientName: 'Growth Solutions',
        location: 'New York, NY',
        description: 'Join our marketing team to develop and execute comprehensive marketing strategies. Perfect opportunity for a creative professional with strong analytical skills.',
        jobType: 'FULL_TIME',
        salary: 85000,
        postedDate: new Date('2024-01-12'),
        applicationsCount: 18
      },
      {
        id: 3,
        jopName: 'UX/UI Designer',
        clientName: 'Design Studio Pro',
        location: 'Remote',
        description: 'We need a talented designer to create beautiful and intuitive user experiences. Work with a collaborative team on exciting projects for diverse clients.',
        jobType: 'REMOTE',
        salary: 75000,
        postedDate: new Date('2024-01-10'),
        applicationsCount: 32
      }
    ];
  }


  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  closeProfileDropdown(): void {
    this.isProfileDropdownOpen = false;
  }

  // Add HostListener to close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any): void {
    if (!event.target.closest('.dropdown')) {
      this.closeProfileDropdown();
    }
  }
}
