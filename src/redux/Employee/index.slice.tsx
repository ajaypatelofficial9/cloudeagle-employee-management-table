import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Employee } from "../../types/employee";

interface EmployeeState {
  employees: Employee[];
  originalEmployees: Employee[];
}

type RootState = {
  employee: EmployeeState;
};

const initialState: EmployeeState = {
  employees: [],
  originalEmployees: [],
};

export const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    updateEmployee: (
      state,
      action: PayloadAction<{
        id: number;
        updatedData: Partial<Employee>;
      }>
    ) => {
      const { id, updatedData } = action.payload;

      const employeeIndex = state.employees.findIndex(
        (employee) => employee.id === id
      );

      if (employeeIndex !== -1) {
        state.employees[employeeIndex] = {
          ...state.employees[employeeIndex],
          ...updatedData,
        };
      }
    },

    setEmployees: (
      state,
      action: PayloadAction<Employee[]>
    ) => {
      state.employees = action.payload;
    },

    setOriginalEmployees: (
      state,
      action: PayloadAction<Employee[]>
    ) => {
      state.originalEmployees = action.payload;
    },

    undoEmployeeChanges: (
      state,
      action: PayloadAction<{ id: number }>
    ) => {
      const { id } = action.payload;

      const originalEmployee = state.originalEmployees.find(
        (employee) => employee.id === id
      );

      const employeeIndex = state.employees.findIndex(
        (employee) => employee.id === id
      );

      if (originalEmployee && employeeIndex !== -1) {
        state.employees[employeeIndex] = originalEmployee;
      }
    },
  },
});

export const {
  updateEmployee,
  setOriginalEmployees,
  undoEmployeeChanges,
  setEmployees
} = employeeSlice.actions;

export const getEmployees = (state: RootState) =>
  state.employee.employees;

export default employeeSlice.reducer;
