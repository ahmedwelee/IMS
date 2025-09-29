import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {ApplicationService} from "../../service/application.service";
import {JobService} from "../../service/job.service";
import {KeycloakService} from "../../service/keycloak.service";
import {ApplicationRequest} from "../../service/application-request";
import {ApplicationResponse} from "../../service/application-response";
import {NgForOf, NgIf} from "@angular/common";


@Component({
  selector: 'app-apply',
  templateUrl: './apply.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    RouterLink,
    NgForOf
  ],
  styleUrls: ['./apply.component.scss']
})
export class ApplyComponent implements OnInit {
  applyForm: FormGroup;
  jobId: string = '';
  jobDetails: any = null;
  isLoading = false;
  isSubmitting = false;
  cvUrl: string = '';
  userProfile: any = null;
  isLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private applicationService: ApplicationService,
    private jobService: JobService,
    private keycloakService: KeycloakService
  ) {
    this.applyForm = this.createForm();
  }

  async ngOnInit(): Promise<void> {
    await this.initializeAuth();

    this.route.queryParams.subscribe(params => {
      this.jobId = params['jobId'];
      if (this.jobId) {
        this.loadJobDetails();
      }
    });

    if (this.isLoggedIn) {
      this.prefillUserData();
    }
  }

  async initializeAuth(): Promise<void> {
    try {
      this.isLoggedIn = await this.keycloakService.isLoggedIn();

      if (this.isLoggedIn) {
        this.userProfile = await this.keycloakService.loadUserProfile();
      } else {
        await this.keycloakService.login();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  prefillUserData(): void {
    if (this.userProfile) {
      this.applyForm.patchValue({
        firstName: this.userProfile.firstName || '',
        lastName: this.userProfile.lastName || '',
      });
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-() ]+$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      nationality: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      cvUrl: ['', [Validators.required, Validators.pattern(/https?:\/\/.+/)]]
    });
  }

  loadJobDetails(): void {
    this.isLoading = true;

    this.jobService.getJobById(+this.jobId).subscribe({
      next: (job) => {
        this.jobDetails = job;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading job details:', error);
        this.isLoading = false;
        alert('Job not found or error loading job details');
        this.router.navigate(['/jobs']);
      }
    });
  }

  onSubmit(): void {
    if (!this.applyForm.valid) {
      this.markFormGroupTouched();
      alert('Please fill all required fields correctly.');
      return;
    }

    if (!this.applyForm.value.cvUrl) {
      alert('Please provide a valid CV URL');
      return;
    }

    this.isSubmitting = true;

    this.createApplication();
  }

  private createApplication(): void {
    const formData = this.applyForm.value;
    const currentDate = new Date().toISOString();

    const applicationRequest: ApplicationRequest = {
      appliedDate: currentDate,
      updatedDate: currentDate,
      candidateId: this.getUserId() || 2,
      jopId: +this.jobId,
      status: 'PENDING',
      firstname: formData.firstName,
      lastname: formData.lastName,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      nationality: formData.nationality,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      cvPath: formData.cvUrl  // Using the URL directly
    };

    this.applicationService.createApplication(applicationRequest).subscribe({
      next: (response: ApplicationResponse) => {
        this.isSubmitting = false;
        alert('Application submitted successfully!');
        this.router.navigate(['/all-jobs'], {
          queryParams: { applied: 'success', jobId: this.jobId }
        });
      },
      error: (error) => {
        console.error('Error submitting application:', error);
        this.isSubmitting = false;

        if (error.status === 409) {
          alert('You have already applied for this job.');
        } else if (error.status === 404) {
          alert('Job not found. It may have been removed.');
        } else {
          alert('Error submitting application. Please try again.');
        }
      }
    });
  }

  private getUserId(): number {
    // Implement this based on your Keycloak setup
    try {
      if (this.userProfile && this.userProfile.id) {
        return +this.userProfile.id;
      }
      if (this.userProfile && this.userProfile.username) {
        // You might need to call your backend to get the numeric user ID
        return 0; // Placeholder
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
    return 0;
  }

  // Form validation helper methods
  markFormGroupTouched(): void {
    Object.keys(this.applyForm.controls).forEach(key => {
      this.applyForm.get(key)?.markAsTouched();
    });
  }

  getFormControl(controlName: string) {
    return this.applyForm.get(controlName);
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.getFormControl(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getFieldError(controlName: string): string {
    const control = this.getFormControl(controlName);
    if (control?.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['minlength']) {
        return `Minimum length is ${control.errors['minlength'].requiredLength}`;
      }
      if (control.errors['pattern']) {
        if (controlName === 'cvUrl') return 'Please enter a valid URL (http:// or https://)';
        return 'Invalid format';
      }
    }
    return '';
  }

  // Utility methods
  formatSalary(salary: number): string {
    if (!salary) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(salary);
  }

  getJobTypeDisplay(jobType: string): string {
    const typeMap: { [key: string]: string } = {
      'FULL_TIME': 'Full Time',
      'PART_TIME': 'Part Time',
      'CONTRACT': 'Contract',
      'REMOTE': 'Remote',
      'INTERNSHIP': 'Internship',
      'FULLTIME': 'Full Time',
      'PARTTIME': 'Part Time'
    };
    return typeMap[jobType] || jobType;
  }

  getJobTypeBadgeClass(jobType: string): string {
    const classMap: { [key: string]: string } = {
      'FULL_TIME': 'bg-success',
      'PART_TIME': 'bg-warning text-dark',
      'CONTRACT': 'bg-info',
      'REMOTE': 'bg-primary',
      'INTERNSHIP': 'bg-secondary',
      'FULLTIME': 'bg-success',
      'PARTTIME': 'bg-warning text-dark'
    };
    return classMap[jobType] || 'bg-secondary';
  }

  // Navigation methods
  cancel(): void {
    if (confirm('Are you sure you want to cancel? Your application progress will be lost.')) {
      this.router.navigate(['/jobs']);
    }
  }

  goToJob(): void {
    this.router.navigate(['/jobs', this.jobId]);
  }

  // Helper method to suggest CV hosting services
  getCVHostingSuggestions(): string[] {
    return [
      'Google Drive: Upload your CV and share the link',
      'Dropbox: Upload and create a shareable link',
      'OneDrive: Microsoft\'s cloud storage service',
      'LinkedIn: Use your LinkedIn profile URL',
      'Personal website or portfolio'
    ];
  }

  // Format date for display
  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Calculate age from date of birth
  calculateAge(dateOfBirth: string): number {
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
}
