import {Component, AfterViewInit, EventEmitter, Output, HostListener} from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import {KeycloakService} from "../../service/keycloak.service";
import {NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
// @ts-ignore
import {KeycloakProfile} from "keycloak-js";
import {Router} from "@angular/router";

declare var $: any;

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
  selector: 'app-navigation',
  standalone: true,
  imports: [NgbDropdownModule, NgIf, FormsModule, ReactiveFormsModule],
  templateUrl: './navigation.component.html'
})
export class NavigationComponent implements AfterViewInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  public showSearch = false;
  isProfileDropdownOpen: boolean = false;
  userProfile: UserProfile = {};
  showProfile: boolean = false;
  keycloakProfile: KeycloakProfile | null = null;
  isLoggedIn: boolean = false;
  userRoles: string[] = [];

  constructor(
    private KcService: KeycloakService,
    private router: Router
  ) {
  }

  async ngOnInit(): Promise<void> {
    await this.initializeAuth();
  }

  ngAfterViewInit() { }

  async initializeAuth(): Promise<void> {
    try {
      this.isLoggedIn = await this.KcService.isLoggedIn();

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
      this.keycloakProfile = await this.KcService.loadUserProfile();
    } catch (error) {
      console.error('Error loading Keycloak profile:', error);
    }
  }

  loadUserRoles(): void {
    try {
      // Get realm roles
      const realmRoles = this.KcService.getUserRoles();
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

  getPrimaryRole(): string {
    if (this.userRoles.includes('admin')) return 'Admin';
    if (this.userRoles.includes('Director')) return 'Director';
    if (this.userRoles.includes('Manager')) return 'Manager';
    if (this.userRoles.includes('Candidate')) return 'Candidate';
    if (this.userRoles.includes('employer')) return 'Employer';
    if (this.userRoles.includes('recruiter')) return 'Recruiter';
    return 'Candidate';
  }

  logout() {
    this.KcService.logout();
  }

  profile() {
    this.KcService.accountManagement()
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

  toClients(): void {
      this.router.navigate(['/clients']);
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any): void {
    if (!event.target.closest('.dropdown')) {
      this.closeProfileDropdown();
    }
  }

  closeProfileDropdown(): void {
    this.isProfileDropdownOpen = false;
  }

  getUserInitials(): string {
    const name = this.getDisplayName();
    if (name.includes(' ')) {
      const parts = name.split(' ');
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }
}
