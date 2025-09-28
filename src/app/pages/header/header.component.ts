import { Component } from '@angular/core';
// @ts-ignore
import {KeycloakProfile} from "keycloak-js";
import {UserProfile} from "../../service/user-profile";
import {Router} from "@angular/router";
import {KeycloakService} from "../../service/keycloak.service";

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

  constructor(
    private router: Router,
    private keycloakService: KeycloakService,
  ) {}

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
}
