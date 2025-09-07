import { Component, OnInit } from '@angular/core';
import { EmployeesService } from '../../service/employee.service';
import { EmployeeRequest } from '../../service/employee-request';
import { EmployeeResponse } from '../../service/employee-response';
import {DatePipe, NgForOf, NgIf, UpperCasePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-employees',
  templateUrl: './employee.component.html',
  standalone: true,
  imports: [
    DatePipe,
    NgForOf,
    UpperCasePipe,
    FormsModule,
    NgIf
  ]
})
export class EmployeesComponent implements OnInit {
  employees: EmployeeResponse[] = [];
  selectedEmployee: EmployeeResponse | null = null;
  showModal: boolean = false;
  isEditMode: boolean = false;
  currentEmployee: EmployeeRequest = {
    email: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    startDate: '',
    position: '',
    jopId: 0,
    clientId: 0
  };

  // These would typically come from other services
  jobs: any[] = []; // You'll need to fetch this from a JobService
  clients: any[] = []; // You'll need to fetch this from a ClientService

  constructor(private employeeService: EmployeesService) {}

  ngOnInit(): void {
    this.loadEmployees();
    // You'll need to load jobs and clients here
    // this.loadJobs();
    // this.loadClients();
  }

  // Load all employees
  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
  }

  // Get single employee
  loadEmployee(id: number): void {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (employee) => {
        this.selectedEmployee = employee;
      },
      error: (error) => {
        console.error('Error loading employee:', error);
      }
    });
  }

  // Open create modal
  openCreateModal(): void {
    this.isEditMode = false;
    this.currentEmployee = {
      email: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      startDate: '',
      position: '',
      jopId: 0,
      clientId: 0
    };
    this.showModal = true;
  }


  openEditModal(employee: EmployeeResponse): void {
    this.isEditMode = true;

    const names = employee.fullName?.split(' ') || [];
    this.currentEmployee = {
      email: employee.email,
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || '',
      dateOfBirth: employee.dateOfBirth,
      startDate: employee.startDate,
      position: employee.position,
      jopId: 0,
      clientId: 0
    };
    this.selectedEmployee = employee;
    this.showModal = true;
  }


  closeModal(): void {
    this.showModal = false;
    this.selectedEmployee = null;
  }

  // todo: use toastr for alerts

  createNewEmployee(): void {
    this.employeeService.createEmployee(this.currentEmployee).subscribe({
      next: (createdEmployee) => {
        console.log('Employee created:', createdEmployee);
        this.employees.push(createdEmployee);
        this.closeModal();
      },
      error: (error) => {
        console.error('Error creating employee:', error);
      }
    });
  }

  updateExistingEmployee(): void {
    if (!this.selectedEmployee?.id) return;

    this.employeeService.updateEmployee(this.selectedEmployee.id, this.currentEmployee).subscribe({
      next: (updatedEmployee) => {
        console.log('Employee updated:', updatedEmployee);
        const index = this.employees.findIndex(e => e.id === updatedEmployee.id);
        if (index !== -1) {
          this.employees[index] = updatedEmployee;
        }
        this.selectedEmployee = updatedEmployee;
        this.closeModal();
      },
      error: (error) => {
        console.error('Error updating employee:', error);
      }
    });
  }

  deleteEmployee(id: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          console.log('Employee deleted successfully');
          this.employees = this.employees.filter(e => e.id !== id);
          if (this.selectedEmployee?.id === id) {
            this.selectedEmployee = null;
          }
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
        }
      });
    }
  }

  calculateAge(dateOfBirth: string | undefined): number {
    if (!dateOfBirth) return 0;

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  // todo to be changed to a pipe
  calculateTenure(startDate: string | undefined): string {
    if (!startDate) return '0 years, 0 months';

    const start = new Date(startDate);
    const today = new Date();
    const years = today.getFullYear() - start.getFullYear();
    const months = today.getMonth() - start.getMonth();

    if (months < 0) {
      return `${years - 1} years, ${12 + months} months`;
    }
    return `${years} years, ${months} months`;
  }
}
