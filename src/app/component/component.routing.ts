import { Routes } from '@angular/router';
import { EmployeesComponent } from './employee/employee.component';
import {ClientsComponent} from "./clients/clients.component";
import {JobsComponent} from "./job/job.component";
import {ProfileComponent} from "./profile/profile.component";
import {ApplicationsComponent} from "./application/application.component";
import {JobApplicationsComponent} from "./job/jobApplication/job-application-component";


export const ComponentsRoutes: Routes = [
	{
		path: '',
		children: [
			{
				path: 'employee',
				component: EmployeesComponent
			},
      {
				path: 'job',
				component: JobsComponent
			},
      {
				path: 'profile',
				component: ProfileComponent
			},
      {
				path: 'application',
				component: ApplicationsComponent
			},
      {
				path: 'jobs/:id/applications',
				component: JobApplicationsComponent
			},
      {
        path: 'clients',
        component: ClientsComponent
      }
		]
	}
];
