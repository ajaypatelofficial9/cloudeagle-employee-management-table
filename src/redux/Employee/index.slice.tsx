import { createSlice } from "@reduxjs/toolkit";
import { generateEmployees } from "../../data/generateEmployees";

const initialState = {
  employees: generateEmployees(10000),
  originalEmployees: [],
};

export const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    updateEmployee: (state, action) => {
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

    setEmployees: (state, action) => {
      state.employees = action.payload;
    },

    setOriginalEmployees: (state, action) => {
      state.originalEmployees = action.payload;
    },

    undoEmployeeChanges: (state, action) => {
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

export const getEmployees = (state: any) =>
  state.employee.employees;

export default employeeSlice.reducer;