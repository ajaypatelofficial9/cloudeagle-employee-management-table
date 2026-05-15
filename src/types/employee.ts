export interface Employee {
  id: number;
  employeeName: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  licensesUsed: number;
  status: "Active" | "Inactive";
  joinDate: string;
}