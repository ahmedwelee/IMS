export interface JobResponse {
  id: number;
  jopName: string;
  description: string;
  salary: number;
  jobType: string;
  location: string;
  status: string;
  postedDate: Date; // or Date
  clientName: string | null;
  managerName: string | null;
  applicationsCount: number;
}
