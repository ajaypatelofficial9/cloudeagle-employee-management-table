import { fakerEN_IN as faker } from "@faker-js/faker";
import type { Employee } from "../types/employee";

const departments = [
  "Engineering",
  "HR",
  "Finance",
  "Marketing",
  "Sales",
];

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Manager",
  "Designer",
  "QA Engineer",
];

export const generateEmployees = (
  count: number
): Employee[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    employeeName: faker.person.fullName(),
    email: faker.internet.email(),
    department:
      departments[
        Math.floor(Math.random() * departments.length)
      ],
    role:
      roles[
        Math.floor(Math.random() * roles.length)
      ],
    salary: faker.number.int({
      min: 30000,
      max: 150000,
    }),
    licensesUsed: faker.number.int({
      min: 1,
      max: 50,
    }),
    status: Math.random() > 0.5
      ? "Active"
      : "Inactive",
    joinDate: faker.date.past().toISOString(),
  }));
};