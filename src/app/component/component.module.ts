import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ComponentsRoutes } from './component.routing';
import { EmployeesComponent } from "./employee/employee.component";
import {ClientsComponent} from "./clients/clients.component";
import {JobsComponent} from "./job/job.component";
import {ApplicationsComponent} from "./application/application.component";
import {JobApplicationsComponent} from "./job/jobApplication/job-application-component";
import {ClientJobsComponent} from "./clients/client-application/client-jobs-component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ComponentsRoutes),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    EmployeesComponent,
    JobsComponent,
    JobApplicationsComponent,
    ApplicationsComponent,
    ClientsComponent,
    ClientJobsComponent
  ],
})
export class ComponentsModule { }
