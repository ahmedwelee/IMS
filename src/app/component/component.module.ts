import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ComponentsRoutes } from './component.routing';
import { EmployeesComponent } from "./employee/employee.component";
import {ClientsComponent} from "./clients/clients.component";
import {JobComponent} from "./job/job.component";
import {ProfileComponent} from "./profile/profile.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ComponentsRoutes),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    EmployeesComponent,
    JobComponent,
    ClientsComponent,
    ProfileComponent
  ],
})
export class ComponentsModule { }
