import {Injectable} from '@angular/core';
// @ts-ignore
import Keycloak from "keycloak-js";
import { UserProfile } from './user-profile';
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private _keycloak: Keycloak | undefined;
  private _profile: UserProfile | undefined;

  constructor(private router: Router, private http: HttpClient) {}

  get keycloak() {
    if (!this._keycloak) {
      this._keycloak = new Keycloak({
        url: 'http://localhost:8080',
        realm: 'Internal_management_system',
        clientId: 'ims'
      });
    }
    return this._keycloak;
  }

  get profile(): UserProfile | undefined {
    return this._profile;
  }

  async init() {
    const authenticated = await this.keycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256'
    });

    if (authenticated) {
      this._profile = (await this.keycloak.loadUserProfile()) as UserProfile;
      (this._profile as any).token = this.keycloak.token || '';

      this.http.get("http://localhost:8088/users/check").subscribe();

      const token = this.keycloak.tokenParsed as any;
      const roles: string[] = token?.realm_access?.roles || [];

      // ✅ Get last visited route
      const lastRoute = localStorage.getItem('lastRoute');

      if (lastRoute && lastRoute !== '/' && lastRoute !== '') {
        // Restore to the same page after reload
        this.router.navigateByUrl(lastRoute);
        console.log('Restoring to last route:', lastRoute);
      } else {
        // First login → redirect by role
        if (roles.includes('candidate')) {
          this.router.navigate(['/home']);
        } else if (roles.includes('Director') || roles.includes('Manager')) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      }
    }
  }


  login() {
    return this.keycloak.login(); // navigation handled in init()
  }

  logout() {
    return this.keycloak.logout({ redirectUri: 'http://localhost:4200/home' });
  }

  accountManagement() {
    return this.keycloak.accountManagement();
  }

  async isLoggedIn() {
    return await this.keycloak.authenticated;
  }

  async loadUserProfile() {
    return await this.keycloak.loadUserProfile();
  }

  getUserRoles() {
    return this.keycloak.tokenParsed?.realm_access?.roles || [];
  }

  async register(param: { redirectUri: string }) {
    return await this.keycloak.register(param);
  }

  isCandidate(): boolean {
    return this.getUserRoles().includes('candidate');
  }

  isDirector(): boolean {
    return this.getUserRoles().includes('Director');
  }

  isManager(): boolean {
    return this.getUserRoles().includes('Manager');
  }
}
