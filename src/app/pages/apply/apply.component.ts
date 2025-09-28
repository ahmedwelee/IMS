import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {ApplicationService} from "../../service/application.service";
import {JobService} from "../../service/job.service";
import {KeycloakService} from "../../service/keycloak.service";
import {ApplicationRequest} from "../../service/application-request";
import {ApplicationResponse} from "../../service/application-response";
import {NgIf} from "@angular/common";


@Component({
  selector: 'app-apply',
  templateUrl: './apply.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    RouterLink
  ],
  styleUrls: ['./apply.component.scss']
})
export class ApplyComponent implements OnInit {
  applyForm: FormGroup;
  jobId: string = '';
  jobDetails: any = null;
  isLoading = false;
  isSubmitting = false;
  selectedFile: File | null = null;
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
        // Redirect to login if not authenticated
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
        // You might have additional user data from your backend
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
      cvPath: ['']
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
        // Show error message or redirect
        alert('Job not found or error loading job details');
        this.router.navigate(['/jobs']);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF or Word document');
        event.target.value = ''; // Clear the input
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        event.target.value = ''; // Clear the input
        return;
      }

      this.selectedFile = file;
      this.applyForm.patchValue({ cvPath: file.name });
    }
  }

  onSubmit(): void {
    if (!this.applyForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    if (!this.selectedFile) {
      alert('Please upload your CV/Resume');
      return;
    }

    this.isSubmitting = true;

    // First upload the CV file, then create the application
    this.uploadCVFile().then((cvPath) => {
      this.createApplication(cvPath);
    }).catch((error) => {
      console.error('Error uploading CV:', error);
      this.isSubmitting = false;
      alert('Error uploading CV. Please try again.');
    });
  }

  private uploadCVFile(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.selectedFile) {
        reject('No file selected');
        return;
      }

      const formData = new FormData();
      formData.append('cvFile', this.selectedFile);

      // Upload CV file to your file storage service
      // Replace this with your actual file upload service
     /* this.applicationService.uploadCV(formData).subscribe({
        next: (response: any) => {
          resolve(response.filePath || response.path || response.url);
        },
        error: (error) => {
          reject(error);
        }
      });*/
    });
  }

  private createApplication(cvPath: string): void {
    const formData = this.applyForm.value;
    const currentDate = new Date().toISOString();

    const applicationRequest: ApplicationRequest = {
      appliedDate: currentDate,
      updatedDate: currentDate,
      candidateId: this.getUserId(), // Get from Keycloak or your user service
      jopId: +this.jobId,
      status: 'PENDING', // Default status
      firstname: formData.firstName,
      lastname: formData.lastName,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      nationality: formData.nationality,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      cvPath: cvPath
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

        // Handle different error types
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
    // Get user ID from Keycloak token or your user service
    // This is a placeholder - implement based on your auth setup
    //const token = this.keycloakService.getToken();
    //if (token) {
      // Parse token to get user ID, or make API call to get user details
      // For now, return a placeholder
      //return 1; // Replace with actual user ID
    //}
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
      if (control.errors['pattern']) return 'Invalid format';
    }
    return '';
  }

  // Utility methods
  formatSalary(salary: number): string {
    return salary ? salary.toLocaleString('en-US') : '0';
  }

  getJobTypeDisplay(jobType: string): string {
    const typeMap: { [key: string]: string } = {
      'FULL_TIME': 'Full Time',
      'PART_TIME': 'Part Time',
      'CONTRACT': 'Contract',
      'REMOTE': 'Remote',
      'INTERNSHIP': 'Internship'
    };
    return typeMap[jobType] || jobType;
  }

  // Navigation methods
  cancel(): void {
    this.router.navigate(['/jobs']);
  }

  goToJob(): void {
    this.router.navigate(['/jobs', this.jobId]);
  }

  // File handling
  removeFile(): void {
    this.selectedFile = null;
    this.applyForm.patchValue({ cvPath: '' });
    // Clear file input
    const fileInput = document.getElementById('cvFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
