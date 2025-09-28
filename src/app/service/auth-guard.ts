import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {KeycloakService} from './keycloak.service';

export const authGuard: CanActivateFn = () => {
  const tokenService  = inject(KeycloakService);
  const router = inject(Router);
  if (tokenService.keycloak.isTokenExpired()) {
    router.navigate(['login']);
    return false;
  }
  return true;
};

export const adminGuard: CanActivateFn = () => {
  const tokenService  = inject(KeycloakService);
  const router = inject(Router);
  if (!(tokenService.isDirector() || tokenService.isManager())) {
    router.navigate(['home']);
    return false;
  }
  return true;
};
