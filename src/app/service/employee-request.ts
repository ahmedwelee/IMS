import { Position } from './position-enum';
export interface EmployeeRequest {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  startDate: string;
  title: string;
  position: Position;
  salary: number;
  jopId?: number | null;
  clientId?: number | null;
  isActive: boolean;
}
