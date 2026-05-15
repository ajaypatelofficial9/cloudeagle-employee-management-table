import { EmployeeTable } from "./components/table";
import { generateEmployees } from "./data/generateEmployees";

function App() {
  const employees = generateEmployees(10000);

  console.log(employees);

  return <>
      <EmployeeTable />
  </>
}

export default App;