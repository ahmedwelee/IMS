import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {ApplicationService} from "../../service/application.service";
import {JobService} from "../../service/job.service";
import {KeycloakService} from "../../service/keycloak.service";
import {ApplicationRequest} from "../../service/application-request";
import {ApplicationResponse} from "../../service/application-response";
import {NgForOf, NgIf} from "@angular/common";
import {CandidateService} from "../../service/candidate.service";
import {ToastrService} from "ngx-toastr";


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
  selectedCvFile: File | null = null;
  userProfile: any = null;
  isLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private applicationService: ApplicationService,
    private candidateService: CandidateService,
    private jobService: JobService,
    private keycloakService: KeycloakService,
    private toastrService: ToastrService
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
      this.toastrService.error('Failed to initialize authentication', 'Error');
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
      cvFile: ['', [Validators.required]]
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
        this.toastrService.error('Job not found or error loading job details', 'Error');
        this.router.navigate(['/jobs']);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

      if (!allowedTypes.includes(file.type)) {
        this.toastrService.error('Please upload a PDF or Word document', 'Invalid File Type');
        input.value = '';
        this.selectedCvFile = null;
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        this.toastrService.error('File size must be less than 5MB', 'File Too Large');
        input.value = '';
        this.selectedCvFile = null;
        return;
      }

      this.selectedCvFile = file;
      this.applyForm.patchValue({ cvFile: file.name });
      this.toastrService.success(`File "${file.name}" selected successfully`, 'Success');
    }
  }

  onSubmit(): void {
    if (!this.applyForm.valid) {
      this.markFormGroupTouched();
      this.toastrService.warning('Please fill all required fields correctly', 'Validation Error');
      return;
    }

    if (!this.selectedCvFile) {
      this.toastrService.warning('Please select a CV file', 'Missing CV');
      return;
    }

    this.isSubmitting = true;
    this.createApplication();
  }

  async createApplication(): Promise<void> {
    const formData = this.applyForm.value;
    const currentDate = new Date().toISOString();
    const userId = await this.getUserIdAsync();

    const applicationRequest: ApplicationRequest = {
      appliedDate: currentDate,
      updatedDate: currentDate,
      candidateId: userId,
      jopId: +this.jobId,
      status: 'PENDING',
      firstname: formData.firstName,
      lastname: formData.lastName,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      nationality: formData.nationality,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      cvPath: ''  // Will be updated after file upload
    };

    this.applicationService.createApplication(applicationRequest).subscribe({
      next: (response: ApplicationResponse) => {
        // Upload CV file after application is created
        if (this.selectedCvFile && response.id) {
          this.uploadCvFile(response.id);
        } else {
          this.isSubmitting = false;
          this.toastrService.success('Application submitted successfully!', 'Success');
          this.router.navigate(['/all-jobs'], {
            queryParams: { applied: 'success', jobId: this.jobId }
          });
        }
      },
      error: (error) => {
        console.error('Error submitting application:', error);
        this.isSubmitting = false;

        if (error.status === 409) {
          this.toastrService.warning('You have already applied for this job', 'Duplicate Application');
        } else if (error.status === 404) {
          this.toastrService.error('Job not found. It may have been removed', 'Job Not Found');
        } else {
          this.toastrService.error('Error submitting application. Please try again', 'Submission Failed');
        }
      }
    });
  }

  uploadCvFile(applicationId: number): void {
    if (!this.selectedCvFile) {
      this.isSubmitting = false;
      return;
    }

    this.applicationService.uploadApplicationCv(applicationId, this.selectedCvFile).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastrService.success('Application and CV submitted successfully!', 'Success');
        this.router.navigate(['/all-jobs'], {
          queryParams: { applied: 'success', jobId: this.jobId }
        });
      },
      error: (error) => {
        console.error('Error uploading CV:', error);
        this.isSubmitting = false;
        this.toastrService.error('Application created but CV upload failed. Please contact support', 'Upload Error');
      }
    });
  }

  private async getUserIdAsync(): Promise<number> {
    if (this.userProfile && this.userProfile.email) {
      try {
        const candidate = await this.candidateService.getCandidateByEmail(this.userProfile.email).toPromise();
        return candidate?.id ?? 0;
      } catch (err) {
        console.error('Error fetching user by email:', err);
        this.toastrService.error('Error fetching user profile', 'Error');
      }
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
    const confirmed = confirm('Are you sure you want to cancel? Your application progress will be lost.');
    if (confirmed) {
      this.router.navigate(['/jobs']);
    }
  }

  goToJob(): void {
    this.router.navigate(['/jobs', this.jobId]);
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

  getSelectedFileName(): string {
    return this.selectedCvFile ? this.selectedCvFile.name : 'No file selected';
  }
}
