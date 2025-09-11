export interface ApplicationRequest {
  applicationName: string;
  appliedDate: string; // or Date
  updatedDate: string; // or Date
  status: string;
  candidateId: number; // Changed from number | null to number (required)
  jopId: number; // Changed from number | null to number (required)
}
