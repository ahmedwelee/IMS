import {Component, HostListener} from '@angular/core';
// @ts-ignore
import {KeycloakProfile} from "keycloak-js";
import {Router} from "@angular/router";
import {KeycloakService} from "../../service/keycloak.service";

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
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {


  isLoggedIn: boolean = false;
  isProfileDropdownOpen: boolean = false;
  keycloakProfile: KeycloakProfile | null = null;
  userProfile: UserProfile = {};
  showProfile: boolean = false;
  userRoles: string[] = [];

  constructor(
    private router: Router,
    private keycloakService: KeycloakService,
  ) {}
  async ngOnInit(): Promise<void> {
    await this.initializeAuth();
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

  async login(): Promise<void> {
    try {
      await this.keycloakService.login();
    } catch (error) {
      console.error('Login failed:', error);
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

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  closeProfileDropdown(): void {
    this.isProfileDropdownOpen = false;
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

  openProfile(): void {
    this.showProfile = true;
  }

  getUserInitials(): string {
    const name = this.getDisplayName();
    if (name.includes(' ')) {
      const parts = name.split(' ');
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  toJobs(): void {
    this.router.navigate(['/all-jobs']);
  }

  navigateToDashboard(): void {
    if (this.isDirector()) {
      this.router.navigate(['/dashboard']);
    } else if (this.isManager()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  toClients(): void {
    if (this.canAccessClients()) {
      this.router.navigate(['/clients']);
    }
  }

  toDashboard(): void {
    this.navigateToDashboard();
  } canAccessClients(): boolean {
    return this.isDirector() || this.isManager();
  }

  isDirector(): boolean {
    return this.keycloakService.getUserRoles().includes('Director');
  }

  isManager(): boolean {
    return this.keycloakService.getUserRoles()?.includes('Manager');
  }

  async logout(): Promise<void> {
    try {
      await this.keycloakService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any): void {
    if (!event.target.closest('.dropdown')) {
      this.closeProfileDropdown();
    }
  }
}
