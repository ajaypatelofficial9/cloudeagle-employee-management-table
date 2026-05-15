import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "@reduxjs/toolkit";
import { employeeSlice } from "../redux";

const rootReducer = combineReducers({
  employee: employeeSlice
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;