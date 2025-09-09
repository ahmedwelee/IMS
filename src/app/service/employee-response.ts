import {Position} from "./position-enum";

export interface EmployeeResponse {
  id: number;
  fullName: string;
  email: string;
  dateOfBirth: string;
  startDate: string;
  title: string;
  position: Position;
  salary: number;
  jopName?: string | null;
  clientName?: string | null;
}
