import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  CommonModule, LocationStrategy,
  PathLocationStrategy
} from '@angular/common';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {  RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FullComponent } from './layouts/full/full.component';


import { NavigationComponent } from './shared/header/navigation.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';

import { Approutes } from './app-routing.module';
import { AppComponent } from './app.component';
import { SpinnerComponent } from './shared/spinner.component';
import {ClientsService} from "./service/clients.service";
import {EmployeesService} from "./service/employee.service";
import {JobService} from "./service/job.service";
import {ApplicationService} from "./service/application.service";
import {ClientJobsComponent} from "./component/clients/client-application/client-jobs-component";
import {JobApplicationsComponent} from "./component/job/jobApplication/job-application-component";
import {ToastrModule} from "ngx-toastr";
import {KeycloakService} from "./service/keycloak.service";
import {HttpTokenInterceptor} from "./service/http-token.interceptor";
import { PublicComponent } from './layouts/public/public.component';
import { HeaderComponent } from './pages/header/header.component';
import {CandidateService} from "./service/candidate.service";


export function kcFactory(kcService: KeycloakService) {
  return () => kcService.init();
}


@NgModule({
  declarations: [
    AppComponent,
    SpinnerComponent,
    PublicComponent,
    HeaderComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    RouterModule.forRoot(Approutes, {useHash: false}),
    FullComponent,
    NavigationComponent,
    SidebarComponent,
    ClientJobsComponent,
    JobApplicationsComponent,
    ToastrModule.forRoot({
      progressBar: true,
      closeButton: true,
      newestOnTop: true,
      tapToDismiss: true,
      positionClass: 'toast-bottom-right',
      timeOut: 8000
    })
  ],
  providers: [
    ClientsService,
    EmployeesService,
    JobService,
    ApplicationService,
    CandidateService,
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpTokenInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      deps: [KeycloakService],
      useFactory: kcFactory,
      multi: true
    }
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
