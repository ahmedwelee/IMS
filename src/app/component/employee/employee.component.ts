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
  showDeleteModal: boolean = false;
  showEmployeeDetailsModal: boolean = false; // New property for details modal

  currentEmployee: EmployeeRequest = {
    email: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    startDate: '',
    title: '',
    position: Position.CONSULTANT,
    salary: 0
    // jopId and clientId are optional, so we don't need to initialize them
  };

  employeeToDelete: EmployeeResponse | null = null;
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

  // NEW: Open employee details modal
  openEmployeeDetailsModal(employee: EmployeeResponse): void {
    this.selectedEmployee = employee;
    this.showEmployeeDetailsModal = true;
    // Add body class to prevent scrolling
    document.body.classList.add('modal-open');
  }

  // NEW: Close employee details modal
  closeEmployeeDetailsModal(): void {
    this.showEmployeeDetailsModal = false;
    this.selectedEmployee = null;
    // Remove body class to restore scrolling
    document.body.classList.remove('modal-open');
  }

  // NEW: Handle backdrop click for employee details modal
  onEmployeeModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeEmployeeDetailsModal();
    }
  }

  // NEW: Edit employee from details modal
  editEmployeeFromModal(employee: EmployeeResponse): void {
    // Close the details modal first
    this.closeEmployeeDetailsModal();

    // Then open the edit modal
    setTimeout(() => {
      this.openEditModal(employee);
    }, 100);
  }

  // NEW: Delete employee from details modal
  deleteEmployeeFromModal(employee: EmployeeResponse): void {
    // Close the details modal first
    this.closeEmployeeDetailsModal();

    // Then open the delete confirmation modal
    setTimeout(() => {
      this.openDeleteModal(employee);
    }, 100);
  }

  // NEW: View employee's job details
  viewEmployeeJob(employee: EmployeeResponse): void {
    // Close employee modal
    this.closeEmployeeDetailsModal();

    // Your logic to show job details
    console.log('View job for employee:', employee.jopName);
    // Example: this.openJobDetailsModal(employee.jobId);
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
      salary: 0
    };
    this.emailError = '';
    this.showModal = true;
  }

  // Open edit modal - Updated to work with details modal
  openEditModal(employee: EmployeeResponse): void {
    this.isEditMode = true;

    // For edit, we need to split fullName into firstName and lastName
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
      position: employee.position as Position, // Cast to Position enum
      salary: employee.salary
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

  openDeleteModal(employee: EmployeeResponse): void {
    this.employeeToDelete = employee;
    this.showDeleteModal = true;
  }

  // Close delete modal
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.employeeToDelete = null;
  }

  confirmDeleteEmployee(): void {
    const employeeId = this.employeeToDelete?.id;
    if (!employeeId) return;

    this.employeeService.deleteEmployee(employeeId).subscribe({
      next: () => {
        this.employees = this.employees.filter(e => e.id !== employeeId);
        this.toastService.success('deleted successfully', 'Done!')
        if (this.selectedEmployee?.id === employeeId) {
          this.selectedEmployee = null;
        }

        this.closeDeleteModal();
      },
      error: (error) => {
        this.toastService.error(error.error.error, 'Oups!!')
        this.closeDeleteModal();
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
   console.log(this.selectedEmployee.id)

    this.employeeService.updateEmployee(this.selectedEmployee.id, this.currentEmployee).subscribe({
      next: (updatedEmployee) => {
        this.toastService.success('updated successfully', 'Done!')
        // Update the local array
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


  // Calculate age from date of birth - Enhanced
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

  // Calculate tenure from start date - Enhanced
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

  // Get position badge class - handle string or Position enum
  getPositionBadgeClass(position: string | Position | undefined): string {
    if (!position) return 'bg-secondary';

    const pos = position.toString(); // Convert to string for comparison

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
