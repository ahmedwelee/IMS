import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-apply',
  templateUrl: './apply.component.html',
  styleUrls: ['./apply.component.scss']
})
export class ApplyComponent implements OnInit {
  applyForm: FormGroup;
  jobId: string = '';
  jobDetails: any = null;
  isLoading = false;
  isSubmitting = false;
  selectedFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.applyForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.jobId = params['jobId'];
      if (this.jobId) {
        this.loadJobDetails();
      }
    });
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
    // Replace with your actual API endpoint
    this.http.get(`/api/jobs/${this.jobId}`).subscribe({
      next: (job) => {
        this.jobDetails = job;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading job details:', error);
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF or Word document');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      this.selectedFile = file;
      this.applyForm.patchValue({ cvPath: file.name });
    }
  }

  onSubmit(): void {
    if (this.applyForm.valid) {
      this.isSubmitting = true;

      const formData = new FormData();
      const applicationData = this.applyForm.value;

      // Append form data
      Object.keys(applicationData).forEach(key => {
        if (key !== 'cvPath' && applicationData[key]) {
          formData.append(key, applicationData[key]);
        }
      });

      // Append file if selected
      if (this.selectedFile) {
        formData.append('cvFile', this.selectedFile);
      }

      // Append job ID
      formData.append('jobId', this.jobId);

      // Submit application
      this.http.post('/api/applications', formData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          alert('Application submitted successfully!');
          this.router.navigate(['/jobs']);
        },
        error: (error) => {
          console.error('Error submitting application:', error);
          this.isSubmitting = false;
          alert('Error submitting application. Please try again.');
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

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
      if (control.errors['minlength']) return `Minimum length is ${control.errors['minlength'].requiredLength}`;
      if (control.errors['pattern']) return 'Invalid format';
    }
    return '';
  }

  cancel(): void {
    this.router.navigate(['/jobs']);
  }
}
