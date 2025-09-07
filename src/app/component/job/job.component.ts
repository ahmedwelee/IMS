import { Component } from '@angular/core';
import { Job, JobList } from './job-data';
import {NgIf, NgFor, NgClass, SlicePipe} from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-job',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule, SlicePipe],
  templateUrl: './job.component.html'
})
export class JobComponent {
  jobs: Job[];

  showJobModal: boolean = false;
  isEditMode: boolean = false;
  currentJob: Job = this.getEmptyJob();

  searchText: string = '';
  statusFilter: string = 'All';
  typeFilter: string = 'All';

  statusOptions = ['Open', 'Closed', 'Paused'];
  typeOptions = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  filterStatusOptions = ['All', 'Open', 'Closed', 'Paused'];
  filterTypeOptions = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'];

  constructor() {
    this.jobs = [...JobList];
  }

  getEmptyJob(): Job {
    return {
      id: 0,
      title: '',
      company: '',
      location: '',
      type: 'Full-time',
      status: 'Open',
      salary: '',
      description: '',
      requirements: '',
      postedDate: new Date().toISOString().split('T')[0],
      applications: 0
    };
  }

  openCreateModal() {
    this.isEditMode = false;
    this.currentJob = this.getEmptyJob();
    this.showJobModal = true;
  }

  openEditModal(job: Job) {
    this.isEditMode = true;
    this.currentJob = { ...job };
    this.showJobModal = true;
  }

  saveJob() {
    if (this.isEditMode) {
      const index = this.jobs.findIndex(j => j.id === this.currentJob.id);
      if (index !== -1) {
        this.jobs[index] = { ...this.currentJob };
      }
    } else {
      const newId = Math.max(...this.jobs.map(j => j.id), 0) + 1;
      this.currentJob.id = newId;
      this.currentJob.postedDate = new Date().toISOString().split('T')[0];
      this.jobs.unshift({ ...this.currentJob });
    }
    this.closeModal();
  }

  deleteJob(job: Job) {
    if (confirm(`Are you sure you want to delete the "${job.title}" position?`)) {
      this.jobs = this.jobs.filter(j => j.id !== job.id);
    }
  }

  closeModal() {
    this.showJobModal = false;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Open': return 'bg-success';
      case 'Closed': return 'bg-danger';
      case 'Paused': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'Full-time': return 'bg-primary';
      case 'Part-time': return 'bg-info';
      case 'Contract': return 'bg-secondary'; // replaced bg-purple
      case 'Internship': return 'bg-dark';    // replaced bg-orange
      default: return 'bg-secondary';
    }
  }

  get filteredJobs(): Job[] {
    return this.jobs.filter(job => {
      const matchesSearch =
        job.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        job.company.toLowerCase().includes(this.searchText.toLowerCase()) ||
        job.location.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesStatus = this.statusFilter === 'All' || job.status === this.statusFilter;
      const matchesType = this.typeFilter === 'All' || job.type === this.typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }

  clearFilters() {
    this.searchText = '';
    this.statusFilter = 'All';
    this.typeFilter = 'All';
  }
}
