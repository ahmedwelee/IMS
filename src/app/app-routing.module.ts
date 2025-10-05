
import { Routes } from '@angular/router';

import { FullComponent } from './layouts/full/full.component';
import { ClientJobsComponent } from './component/clients/client-application/client-jobs-component';
import {JobApplicationsComponent} from "./component/job/jobApplication/job-application-component";
import {adminGuard, authGuard} from "./service/auth-guard";
import {HomeComponent} from "./pages/home/home.component";
import {JobsForAllComponent} from "./pages/jobs-for-all/jobs-for-all.component";
import {ApplyComponent} from "./pages/apply/apply.component";
import {PublicComponent} from "./layouts/public/public.component";
import {ApplicationHistoryComponent} from "./pages/application-history/application-history.component";
export const Approutes: Routes = [
  {

    path: '',
    component: FullComponent,
    canActivate: [adminGuard],
    children: [
      // 👇 remove redirect to dashboard
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
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
    path: '',
    component: PublicComponent,
    children: [
      {
        path: 'all-jobs',
        component: JobsForAllComponent,
      },
      {
        path: 'apply',
        component: ApplyComponent,
      },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'history',
        component: ApplicationHistoryComponent,
      },
      // 👇 keep wildcard last
      {
        path: '**',
        redirectTo: '/home',
        pathMatch: 'full'
      }
    ]
  }

];
