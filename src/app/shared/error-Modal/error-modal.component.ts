import { Component, OnInit } from '@angular/core';
import { ErrorService } from '../../service/error.service';
import { ErrorDetails } from '../../service/error-details';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.css']
})
export class ErrorModalComponent implements OnInit {
  error: ErrorDetails | null = null;
  showModal: boolean = false;

  constructor(private errorService: ErrorService) {}

  ngOnInit(): void {
    this.errorService.error$.subscribe(error => {
      this.error = error;
      this.showModal = !!error;
    });
  }

  closeModal(): void {
    this.errorService.clearError();
    this.showModal = false;
  }

  getStatusClass(statusCode?: number): string {
    if (!statusCode) return 'bg-secondary';

    if (statusCode >= 200 && statusCode < 300) return 'bg-success';
    if (statusCode >= 300 && statusCode < 400) return 'bg-info';
    if (statusCode >= 400 && statusCode < 500) return 'bg-warning';
    if (statusCode >= 500) return 'bg-danger';

    return 'bg-secondary';
  }
}
