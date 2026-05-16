import { createColumnHelper } from "@tanstack/react-table";
import type { FilterFn } from "@tanstack/react-table";
import type { Employee } from "../../../types/employee";

const columnHelper = createColumnHelper<Employee>();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type EditableEmployee = Partial<Employee>;
const inputClasses =
  "h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200";
const primaryButtonClasses =
  "inline-flex h-9 min-w-16 cursor-pointer items-center justify-center rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300";
const secondaryButtonClasses =
  "inline-flex h-9 min-w-16 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50";
const editButtonClasses =
  "inline-flex h-9 min-w-16 cursor-pointer items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-700";
const undoButtonClasses =
  "inline-flex h-9 min-w-16 cursor-pointer items-center justify-center rounded-md border border-rose-200 bg-rose-50 px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100";
const salaryFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

const exactTextFilter: FilterFn<Employee> = (
  row,
  columnId,
  filterValue
) => {
  if (!filterValue) return true;

  return row.getValue(columnId) === filterValue;
};

const toDateInputValue = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const dateFilter: FilterFn<Employee> = (
  row,
  columnId,
  filterValue
) => {
  if (!filterValue) return true;

  return toDateInputValue(row.getValue<string>(columnId)) === filterValue;
};

const salaryRangeFilter: FilterFn<Employee> = (
  row,
  columnId,
  filterValue
) => {
  const salary = row.getValue<number>(columnId);
  const minValue = String(filterValue?.min ?? "").trim();
  const maxValue = String(filterValue?.max ?? "").trim();
  const min = Number(minValue);
  const max = Number(maxValue);
  const hasMin = minValue !== "" && Number.isFinite(min);
  const hasMax = maxValue !== "" && Number.isFinite(max);

  if (!hasMin && !hasMax) return true;
  if (hasMin && salary < min) return false;
  if (hasMax && salary > max) return false;

  return true;
};

export const columns = (
  editingRowId: number | null,
  editedDataRef: React.MutableRefObject<EditableEmployee>,
  handleInputChange: (
    field: keyof Employee,
    value: string | number
  ) => void,
  handleEdit: (row: Employee) => void,
  handleSave: (id: number) => void,
  handleCancel: () => void,
  handleUndo: (id: number) => void,
  setEditingField: (field: string | null) => void,
  savedHistory: Record<number, Employee>
) => [
    columnHelper.accessor("employeeName", {
      header: "Employee Name",

      cell: (info) =>
        editingRowId === info.row.original.id ? (
          <input
            autoFocus
            onFocus={() => setEditingField("employeeName")}
            value={editedDataRef.current?.employeeName || ""}
            onChange={(e) =>
              handleInputChange(
                "employeeName",
                e.target.value
              )
            }
            className={inputClasses}
          />
        ) : (
          <span className="font-medium text-slate-900">
            {info.getValue()}
          </span>
        ),
    }),

    columnHelper.accessor("email", {
      header: "Email",

      cell: (info) => {
        const emailValue = editedDataRef.current?.email || "";
        const emailInvalid =
          editingRowId === info.row.original.id &&
          typeof emailValue === "string" &&
          (!emailRegex.test(emailValue) || /\s/.test(emailValue));

        return editingRowId === info.row.original.id ? (
          <div>
            <input
              type="text"
              inputMode="email"
              onFocus={() => setEditingField("email")}
              value={emailValue}
              onChange={(e) =>
                handleInputChange("email", e.target.value)
              }
              className={`${inputClasses} ${emailInvalid ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100" : ""}`}
            />
          </div>
        ) : (
          <span className="text-slate-600">{info.getValue()}</span>
        );
      },
    }),

    columnHelper.accessor("department", {
      header: "Department",
      filterFn: exactTextFilter,
    }),

    columnHelper.accessor("role", {
      header: "Role",
    }),

    columnHelper.accessor("salary", {
      header: "Salary",
      filterFn: salaryRangeFilter,

      cell: (info) =>
        editingRowId === info.row.original.id ? (
          <input
            onFocus={() => setEditingField("salary")}
            type="number"
            value={editedDataRef.current?.salary || ""}
            onChange={(e) =>
              handleInputChange(
                "salary",
                Number(e.target.value)
              )
            }
            className={inputClasses}
          />
        ) : (
          <span className="font-medium text-slate-900">
            {salaryFormatter.format(info.getValue())}
          </span>
        ),
    }),

    columnHelper.accessor("licensesUsed", {
      header: "Licenses Used",
    }),

    columnHelper.accessor("status", {
      header: "Status",
      filterFn: exactTextFilter,
      cell: (info) => (
        <span
          className={`inline-flex h-7 w-24 items-center justify-center rounded-full text-xs font-semibold ring-1 ${info.getValue() === "Active"
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : "bg-slate-100 text-slate-600 ring-slate-200"
            }`}
        >
          {info.getValue()}
        </span>
      ),
    }),

    columnHelper.accessor("joinDate", {
      header: "Join Date",
      filterFn: dateFilter,

      cell: (info) =>
        new Date(info.getValue()).toLocaleDateString(),
    }),

    columnHelper.display({
      id: "actions",

      header: "Actions",

      cell: ({ row }) => {
        const employee = row.original;
        const emailValue = editedDataRef.current?.email || "";
        const emailInvalid =
          editingRowId === employee.id &&
          typeof emailValue === "string" &&
          (!emailRegex.test(emailValue) || /\s/.test(emailValue));

        return editingRowId === employee.id ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(employee.id)}
              disabled={emailInvalid}
              title={emailInvalid ? "Please fix the email before saving." : "Save changes"}
              className={primaryButtonClasses}
            >
              Save
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className={secondaryButtonClasses}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleEdit(employee)}
              className={editButtonClasses}
            >
              Edit
            </button>

            {savedHistory && savedHistory[employee.id] && (
              <button
                type="button"
                onClick={() => handleUndo(employee.id)}
                className={undoButtonClasses}
              >
                Undo
              </button>
            )}
          </div>
        );
      },
    }),
  ];
