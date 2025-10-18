import { Routes } from '@angular/router';
import { EmployeesComponent } from './employee/employee.component';
import {ClientsComponent} from "./clients/clients.component";
import {JobsComponent} from "./job/job.component";
import {ApplicationsComponent} from "./application/application.component";
import {JobApplicationsComponent} from "./job/jobApplication/job-application-component";
import {ClientJobsComponent} from "./clients/client-application/client-jobs-component";
import {CandidatesComponent} from "./candidate/candidate.component";


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
      },
      {
      path: 'client-jobs/:id',
        component: ClientJobsComponent
      },
      {
        path: 'candidates',
        component: CandidatesComponent
      }
		]
	}
];
