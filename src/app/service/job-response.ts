export interface JobResponse {
  id: number;
  jopName: string;
  description: string;
  salary: number;
  jobType: string;
  location: string;
  status: string;
  postedDate: string; // or Date
  clientName: string | null;
  managerName: string | null;
  applicationsCount: number;
}
