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

  constructor(private router: Router, private http: HttpClient) {
  }
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

  private _profile: UserProfile | undefined;

  get profile(): UserProfile | undefined {
    return this._profile;
  }

  async init() {
    const authenticated = await this.keycloak.init({
      onLoad: 'check-sso',
    });

    if (authenticated) {
      this._profile = (await this.keycloak.loadUserProfile()) as UserProfile;
      this._profile.token = this.keycloak.token || '';
    }
  }

  login() {
    return this.keycloak.login().then(() => {
      const token = this.keycloak.tokenParsed as any;
      const roles: string[] = token?.realm_access?.roles || [];
      this.checkUser();
      if (roles.includes('candidate')) {
        // get candidate information by email
        this.router.navigate(['/home']);
      } else if (roles.includes('Director') || roles.includes('Manager')) {
        //get manager information
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/home']); // fallback
      }

      //check the user is registered or not

      // check if the connected user is candidate =
    });
  }

  checkUser() {
    this.http.get('http://localhost:8088/users/check').subscribe();
  }

  logout() {

    return this.keycloak.logout({redirectUri: 'http://localhost:4200/home'});
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
