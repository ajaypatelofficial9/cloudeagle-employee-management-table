import { createColumnHelper } from "@tanstack/react-table";
import type { Employee } from "../../../types/employee";

const columnHelper = createColumnHelper<Employee>();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const columns = (
  editingRowId: number | null,
  editedDataRef: React.MutableRefObject<any>,
  handleInputChange: (
    field: string,
    value: string | number
  ) => void,
  handleEdit: (row: Employee) => void,
  handleSave: (id: number) => void,
  handleCancel: () => void,
  handleUndo: (id: number) => void,
  editingField: string | null,
  setEditingField: (field: string | null) => void,
  savedHistory: Record<number, any>
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
            className="w-full rounded border px-2 py-1"
          />
        ) : (
          info.getValue()
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
              onFocus={() => setEditingField("email")}
              value={emailValue}
              onChange={(e) =>
                handleInputChange("email", e.target.value)
              }
              className={`w-full rounded border px-2 py-1 ${emailInvalid ? "border-red-500" : "border-gray-700"}`}
            />
          </div>
        ) : (
          info.getValue()
        );
      },
    }),

    columnHelper.accessor("department", {
      header: "Department",
    }),

    columnHelper.accessor("role", {
      header: "Role",
    }),

    columnHelper.accessor("salary", {
      header: "Salary",

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
            className="w-full rounded border px-2 py-1"
          />
        ) : (
          `${info.getValue()}`
        ),
    }),

    columnHelper.accessor("licensesUsed", {
      header: "Licenses Used",
    }),

    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => (
        <span
          className={`px-2 py-1 rounded text-sm w-24 text-center inline-block ${info.getValue() === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
            }`}
        >
          {info.getValue()}
        </span>
      ),
    }),

    columnHelper.accessor("joinDate", {
      header: "Join Date",

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
              onClick={() => handleSave(employee.id)}
              disabled={emailInvalid}
              title={emailInvalid ? "Please fix the email before saving." : "Save changes"}
              className={`rounded px-3 py-1 text-white ${emailInvalid ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
            >
              Save
            </button>

            <button
              onClick={handleCancel}
              className="rounded bg-gray-500 px-3 py-1 text-white"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(employee)}
              className="rounded bg-blue-500 px-3 py-1 text-white"
            >
              Edit
            </button>

            {savedHistory && savedHistory[employee.id] && (
              <button
                onClick={() => handleUndo(employee.id)}
                className="rounded bg-red-500 px-3 py-1 text-white"
              >
                Undo
              </button>
            )}
          </div>
        );
      },
    }),
  ];