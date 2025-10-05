import { Component, OnInit } from '@angular/core';
import { EmployeesService } from '../../service/employee.service';
import { EmployeeRequest } from '../../service/employee-request';
import { EmployeeResponse } from '../../service/employee-response';
import {DatePipe, NgForOf, NgIf, UpperCasePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {Position} from "../../service/position-enum";
import {JobResponse} from "../../service/job-response";
import {ToastrService} from "ngx-toastr";

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
  showEmployeeDetailsModal: boolean = false;

  currentEmployee: EmployeeRequest = {
    email: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    startDate: '',
    title: '',
    position: Position.CONSULTANT,
    salary: 0,
    isActive: true// Default to active for new employees
  };

  positionOptions = Object.values(Position);
  emailError: string = '';

  constructor(
    private employeeService: EmployeesService,
    private toastService: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  // Load all employees
  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (error) => {
        this.toastService.error(error.error.error, 'Oups!!')
      }
    });
  }

  // Toggle employee active status
  toggleEmployeeStatus(employee: EmployeeResponse): void {
    const newStatus = !employee.isActive;
    const statusText = newStatus ? 'activate' : 'deactivate';

    // Update employee status
    this.employeeService.updateEmployeeStatus(employee.id, newStatus).subscribe({
      next: (updatedEmployee) => {
        // Update local array
        const index = this.employees.findIndex(e => e.id === employee.id);
        if (index !== -1) {
          this.employees[index] = updatedEmployee;
        }

        this.toastService.success(`Employee ${statusText}d successfully`, 'Done!');
      },
      error: (error) => {
        this.toastService.error(error.error.error || `Failed to ${statusText} employee`, 'Oups!!');
      }
    });
  }

  // Toggle from details modal
  toggleEmployeeStatusFromModal(employee: EmployeeResponse): void {
    this.toggleEmployeeStatus(employee);
    // Update the selected employee reference
    this.selectedEmployee = { ...employee, isActive: !employee.isActive };
  }

  // Open employee details modal
  openEmployeeDetailsModal(employee: EmployeeResponse): void {
    this.selectedEmployee = employee;
    this.showEmployeeDetailsModal = true;
    document.body.classList.add('modal-open');
  }

  // Close employee details modal
  closeEmployeeDetailsModal(): void {
    this.showEmployeeDetailsModal = false;
    this.selectedEmployee = null;
    document.body.classList.remove('modal-open');
  }

  // Handle backdrop click for employee details modal
  onEmployeeModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeEmployeeDetailsModal();
    }
  }

  // Edit employee from details modal
  editEmployeeFromModal(employee: EmployeeResponse): void {
    this.closeEmployeeDetailsModal();
    setTimeout(() => {
      this.openEditModal(employee);
    }, 100);
  }

  // View employee's job details
  viewEmployeeJob(employee: EmployeeResponse): void {
    this.closeEmployeeDetailsModal();
    console.log('View job for employee:', employee.jopName);
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
      title: '',
      position: Position.CONSULTANT,
      salary: 0,
      isActive: true // New employees are active by default
    };
    this.emailError = '';
    this.showModal = true;
  }

  // Open edit modal
  openEditModal(employee: EmployeeResponse): void {
    this.isEditMode = true;

    const names = employee.fullName?.split(' ') || [];
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';

    this.currentEmployee = {
      email: employee.email,
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: employee.dateOfBirth,
      startDate: employee.startDate,
      title: employee.title,
      position: employee.position as Position,
      salary: employee.salary,
      isActive: employee.isActive
    };
    this.selectedEmployee = employee;
    this.emailError = '';
    this.showModal = true;
  }

  // Close modal
  closeModal(): void {
    this.showModal = false;
    this.selectedEmployee = null;
    this.emailError = '';
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Handle email input changes
  onEmailChange(email: string): void {
    this.currentEmployee.email = email;
    if (email && !this.validateEmail(email)) {
      this.emailError = 'Please enter a valid email address';
    } else {
      this.emailError = '';
    }
  }

  // Create new employee
  createNewEmployee(): void {
    if (this.emailError) {
      return;
    }

    if (!this.validateEmail(this.currentEmployee.email)) {
      this.emailError = 'Please enter a valid email address';
      return;
    }

    this.employeeService.createEmployee(this.currentEmployee).subscribe({
      next: (createdEmployee) => {
        this.toastService.success('created successfully', 'Done!')
        this.employees.push(createdEmployee);
        this.closeModal();
      },
      error: (error) => {
        this.toastService.error(error.error.error, 'Oups!!')
        if (error.status === 400) {
          this.emailError = 'Email may already exist or is invalid';
        }
      }
    });
  }

  // Update employee
  updateExistingEmployee(): void {
    if (!this.selectedEmployee?.id) return;

    if (this.emailError) {
      return;
    }

    if (!this.validateEmail(this.currentEmployee.email)) {
      this.emailError = 'Please enter a valid email address';
      return;
    }

    this.employeeService.updateEmployee(this.selectedEmployee.id, this.currentEmployee).subscribe({
      next: (updatedEmployee) => {
        this.toastService.success('updated successfully', 'Done!')
        const index = this.employees.findIndex(e => e.id === updatedEmployee.id);
        if (index !== -1) {
          this.employees[index] = updatedEmployee;
        }
        this.selectedEmployee = updatedEmployee;
        this.closeModal();
      },
      error: (err) => {
        this.toastService.error(err.error.error, 'Oups!!')
      }
    });
  }

  // Calculate age from date of birth
  calculateAge(dateOfBirth: string | undefined): number {
    if (!dateOfBirth) return 0;

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  // Calculate tenure from start date
  calculateTenure(startDate: string | undefined): string {
    if (!startDate) return 'Unknown';

    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
  }

  // Format salary with commas
  formatSalary(salary: number | undefined): string {
    if (!salary) return '0';
    return salary.toLocaleString('en-US');
  }

  // Get position badge class
  getPositionBadgeClass(position: string | Position | undefined): string {
    if (!position) return 'bg-secondary';

    const pos = position.toString();

    switch (pos) {
      case 'DIRECTOR':
        return 'bg-danger';
      case 'MANAGER':
        return 'bg-warning';
      case 'ADMINISTRATION':
        return 'bg-info';
      case 'CONSULTANT':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  // Convert string to Position enum
  getPositionDisplay(position: string | Position | undefined): string {
    if (!position) return 'Unknown';
    return position.toString();
  }
}
