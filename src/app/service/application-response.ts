export interface ApplicationResponse {
  id: number;
  applicationName: string;
  appliedDate: string; // or Date
  updatedDate: string; // or Date
  status: string;
  candidateFullName: string;
  jopTitle: string;
}
