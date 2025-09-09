export interface JobRequest {
  jopName: string;
  description: string;
  salary: number;
  jobType: string;
  location: string;
  status: string;
  postedDate: string; // or Date if you prefer
  clientId: number | null;
  managerId: number | null;
}
