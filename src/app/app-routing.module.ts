
import { Routes } from '@angular/router';

import { FullComponent } from './layouts/full/full.component';
import { ClientJobsComponent } from './component/clients/client-application/client-jobs-component';
import {JobApplicationsComponent} from "./component/job/jobApplication/job-application-component";
import {authGuard} from "./service/auth-guard";
import {HomeComponent} from "./pages/home/home.component";
import {JobsForAllComponent} from "./pages/jobs-for-all/jobs-for-all.component";

export const Approutes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [authGuard]
      },
      {
        path: 'about',
        loadChildren: () => import('./about/about.module').then(m => m.AboutModule),
        canActivate: [authGuard]
      },
      {
        path: 'jobs/:id/applications',
        component: JobApplicationsComponent,
        canActivate: [authGuard]
      },
      { path: 'client-jobs/:id', component: ClientJobsComponent , canActivate: [authGuard] },
      {
        path: 'component',
        loadChildren: () => import('./component/component.module').then(m => m.ComponentsModule),
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: 'all-jobs',
    component: JobsForAllComponent,
  },
  {
    path: '**',
    redirectTo: '/home'
  },
  {
    path: 'home',
    component: HomeComponent,
  },

];
