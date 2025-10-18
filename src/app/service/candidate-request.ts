export interface CandidateRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  nationality: string;
  gender: string;
  dateOfBirth: string;  // use string because Angular sends ISO date strings
  cvPath?: string;
  isActive: boolean;
}

