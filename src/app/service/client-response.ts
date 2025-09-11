export interface ClientResponse {
  id: number;
  name: string;
  type: string;
  phoneNumber: string;
  address: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  employeeId: number | null;
  employeeName: string | null;
  jobsCount: number;
}
