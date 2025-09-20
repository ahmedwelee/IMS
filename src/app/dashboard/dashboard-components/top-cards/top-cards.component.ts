import { Component, OnInit } from '@angular/core';
import {StatCard} from './top-cards-data';
import {ClientsService} from "../../../service/clients.service";
import {EmployeesService} from "../../../service/employee.service";
import {JobService} from "../../../service/job.service";
import {ApplicationService} from "../../../service/application.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-top-cards',
  templateUrl: './top-cards.component.html'
})
export class TopCardsComponent implements OnInit {

  topcards: StatCard[] = [
    {
      title: 0,
      subtitle: 'Total Applications',
      bgcolor: 'primary',
      icon: 'bi bi-bag',
      loading: true
    },
    {
      title: 0,
      subtitle: 'Total Employees',
      bgcolor: 'success',
      icon: 'bi bi-people',
      loading: true
    },
    {
      title: 0,
      subtitle: 'Total Clients',
      bgcolor: 'warning',
      icon: 'bi bi-people',
      loading: true
    },
    {
      title: 0,
      subtitle: 'Total Jobs',
      bgcolor: 'info',
      icon: 'bi bi-briefcase',
      loading: true
    }
  ];

  constructor(
    private clientsService: ClientsService,
    private employeeService: EmployeesService,
    private toastService: ToastrService,
    private jobService: JobService,
    private applicationService: ApplicationService // Add this if you have it
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    // Load Applications Count
    this.loadApplicationsCount();

    // Load Employees Count
    this.loadEmployeesCount();

    // Load Clients Count
    this.loadClientsCount();
    // Load Jobs Count
    this.loadJobsCount();
  }

  private loadApplicationsCount(): void {
    // If you have an applications service
      this.applicationService.getApplicationCount().subscribe({
        next: (count) => {
          this.topcards[0].title = count;
          this.topcards[0].loading = false;
        },
        error: (error) => {
          this.toastService.error(error.error.error, 'Oups!!');
          this.topcards[0].title = 0;
          this.topcards[0].loading = false;
        }
      });
  }

  private loadEmployeesCount(): void {
    this.employeeService.getEmployeesCount().subscribe({
      next: (count) => {
        this.topcards[1].title = count;
        this.topcards[1].loading = false;
      },
      error: (error) => {
        this.toastService.error(error.error.error, 'Oups!!');
        this.topcards[1].title = 0;
        this.topcards[1].loading = false;
      }
    });
  }

  private loadClientsCount(): void {
    this.clientsService.getClientsCount().subscribe({
      next: (count) => {
        this.topcards[2].title = count;
        this.topcards[2].loading = false;
      },
      error: (error) => {
        this.toastService.error(error.error.error, 'Oups!!');
        this.topcards[2].title = 0;
        this.topcards[2].loading = false;
      }
    });
  }

  private loadJobsCount(): void {
    this.jobService.getJobsCount().subscribe({
      next: (jobs) => {
        this.topcards[3].title = jobs;
        this.topcards[3].loading = false;
      },
      error: (error) => {
        this.toastService.error(error.error.error, 'Oups!!');
        this.topcards[3].title = 0;
        this.topcards[3].loading = false;
      }
    });
  }

  // Method to refresh all statistics
  refreshStats(): void {
    // Reset loading states
    this.topcards.forEach(card => {
      card.loading = true;
      card.title = 0;
    });

    // Reload all statistics
    this.loadStatistics();
  }

}
