import { Routes } from '@angular/router';
import { EmployeesComponent } from './employee/employee.component';
import {ClientsComponent} from "./clients/clients.component";
import {JobsComponent} from "./job/job.component";
import {ProfileComponent} from "./profile/profile.component";


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
        path: 'clients',
        component: ClientsComponent
      }
		]
	}
];
