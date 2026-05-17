import { lazy, Suspense } from "react";

const EmployeeTable = lazy(
  () => import("./components/table/Employee/EmployeeTable")
);

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmployeeTable />
    </Suspense>
  );
}

export default App;