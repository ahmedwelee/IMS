import {Component, OnInit} from '@angular/core';
import { CandidateResponse } from 'src/app/service/candidate-response';
import {CandidateRequest} from "../../service/candidate-request";
import {ToastrService} from "ngx-toastr";
import {CandidateService} from "../../service/candidate.service";
import {DatePipe, NgForOf, NgIf, UpperCasePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-candidate',
  templateUrl: './candidate.component.html',
  standalone: true,
  imports: [
    UpperCasePipe,
    FormsModule,
    NgIf,
    DatePipe,
    NgForOf
  ],
  styleUrls: ['./candidate.component.scss']
})
export class CandidatesComponent implements OnInit {
  candidates: CandidateResponse[] = [];
  selectedCandidate: CandidateResponse | null = null;
  showModal: boolean = false;
  isEditMode: boolean = false;
  showCandidateDetailsModal: boolean = false;

  currentCandidate: CandidateRequest = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    nationality: '',
    gender: '',
    dateOfBirth: '',
    cvPath: '',
    isActive: true
  };

  constructor(
    private candidateService: CandidateService,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCandidates();
  }

  // Load all candidates
  loadCandidates(): void {
    this.candidateService.getAll().subscribe({
      next: (candidates) => {
        this.candidates = candidates;
      },
      error: (error) => {
        this.toastService.error(error.error?.error || 'Failed to load candidates', 'Error!');
      }
    });
  }

  // Toggle candidate active status
  toggleCandidateStatus(candidate: CandidateResponse): void {
    const newStatus = !candidate.isActive;
    const statusText = newStatus ? 'activate' : 'deactivate';

    this.candidateService.updateStatus(candidate.id, newStatus).subscribe({
      next: (updatedCandidate) => {
        // Update local array
        const index = this.candidates.findIndex(c => c.id === candidate.id);
        if (index !== -1) {
          this.candidates[index] = updatedCandidate;
        }

        this.toastService.success(`Candidate ${statusText}d successfully`, 'Done!');
      },
      error: (error) => {
        this.toastService.error(error.error?.error || `Failed to ${statusText} candidate`, 'Error!');
      }
    });
  }

  // Toggle from details modal
  toggleCandidateStatusFromModal(candidate: CandidateResponse): void {
    this.toggleCandidateStatus(candidate);
    // Update the selected candidate reference
    this.selectedCandidate = { ...candidate, isActive: !candidate.isActive };
  }

  // Open candidate details modal
  openCandidateDetailsModal(candidate: CandidateResponse): void {
    this.selectedCandidate = candidate;
    this.showCandidateDetailsModal = true;
    document.body.classList.add('modal-open');
  }

  // Close candidate details modal
  closeCandidateDetailsModal(): void {
    this.showCandidateDetailsModal = false;
    this.selectedCandidate = null;
    document.body.classList.remove('modal-open');
  }

  // Edit candidate from details modal
  editCandidateFromModal(candidate: CandidateResponse): void {
    this.closeCandidateDetailsModal();
    setTimeout(() => {
      this.openEditModal(candidate);
    }, 100);
  }

  // Open create modal
  openCreateModal(): void {
    this.isEditMode = false;
    this.currentCandidate = {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      nationality: '',
      gender: '',
      dateOfBirth: '',
      cvPath: '',
      isActive: true
    };
    this.showModal = true;
  }

  // Open edit modal
  openEditModal(candidate: CandidateResponse): void {
    this.isEditMode = true;

    // Split fullName into firstName and lastName
    const names = candidate.fullName?.split(' ') || [];
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';

    this.currentCandidate = {
      firstName: firstName,
      lastName: lastName,
      phoneNumber: candidate.phoneNumber,
      address: candidate.address,
      nationality: candidate.nationality,
      gender: candidate.gender,
      dateOfBirth: candidate.dateOfBirth,
      cvPath: '',
      isActive: candidate.isActive
    };
    this.selectedCandidate = candidate;
    this.showModal = true;
  }

  // Close modal
  closeModal(): void {
    this.showModal = false;
    this.selectedCandidate = null;
  }

  // Create new candidate
  createNewCandidate(): void {
    this.candidateService.create(this.currentCandidate).subscribe({
      next: (createdCandidate) => {
        this.toastService.success('Candidate created successfully', 'Done!');
        this.candidates.push(createdCandidate);
        this.closeModal();
      },
      error: (error) => {
        this.toastService.error(error.error?.error || 'Failed to create candidate', 'Error!');
      }
    });
  }

  // Update candidate
  updateExistingCandidate(): void {
    if (!this.selectedCandidate?.id) return;

    this.candidateService.update(this.selectedCandidate.id, this.currentCandidate).subscribe({
      next: (updatedCandidate) => {
        this.toastService.success('Candidate updated successfully', 'Done!');
        // Update the local array
        const index = this.candidates.findIndex(c => c.id === updatedCandidate.id);
        if (index !== -1) {
          this.candidates[index] = updatedCandidate;
        }
        this.selectedCandidate = updatedCandidate;
        this.closeModal();
      },
      error: (error) => {
        this.toastService.error(error.error?.error || 'Failed to update candidate', 'Error!');
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
}
