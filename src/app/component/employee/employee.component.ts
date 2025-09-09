import { Component, OnInit } from '@angular/core';
import { EmployeesService } from '../../service/employee.service';
import { EmployeeRequest } from '../../service/employee-request';
import { EmployeeResponse } from '../../service/employee-response';
import {DatePipe, NgForOf, NgIf, UpperCasePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {Position} from "../../service/position-enum";

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
    title: '',
    position: Position.CONSULTANT,
    salary: 0
    // jopId and clientId are optional, so we don't need to initialize them
  };

  positionOptions = Object.values(Position);
  emailError: string = '';

  constructor(private employeeService: EmployeesService) {
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
      title: '',
      position: Position.CONSULTANT,
      salary: 0
    };
    this.emailError = '';
    this.showModal = true;
  }

  // Open edit modal
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
        console.log('Employee created:', createdEmployee);
        this.employees.push(createdEmployee);
        this.closeModal();
      },
      error: (error) => {
        console.error('Error creating employee:', error);
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
        console.log('Employee updated:', updatedEmployee);
        // Update the local array
        const index = this.employees.findIndex(e => e.id === updatedEmployee.id);
        if (index !== -1) {
          this.employees[index] = updatedEmployee;
        }
        this.selectedEmployee = updatedEmployee;
        this.closeModal();
      },
      error: (error) => {
        console.error('Error updating employee:', error);
        if (error.status === 400) {
          this.emailError = 'Email may already exist or is invalid';
        }
      }
    });
  }

  // Delete employee
  deleteEmployee(id: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          console.log('Employee deleted successfully');
          // Remove from local array
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

  // Calculate age from date of birth
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

  // Calculate tenure from start date
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
