import {Component, OnInit} from "@angular/core";
import { KeycloakService } from "../service/keycloak.service";


@Component({
  selector: 'app-login',
  templateUrl: 'login-component.html',

})
export class LoginComponent implements OnInit {

  constructor(
    private ss: KeycloakService
  ) {
  }

  async ngOnInit(): Promise<void> {
    await this.ss.init();
    await this.ss.login();
  }
}
