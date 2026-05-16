import {
  type Column,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { columns } from "./columns";
import { getEmployees, setEmployees } from "../../../redux/Employee/index.slice";
import type { Employee } from "../../../types/employee";

const gridTemplate =
  "180px 250px 180px 220px 140px 140px 140px 180px 180px";
type EditableEmployee = Partial<Employee>;
type SalaryFilterValue = {
  min?: string;
  max?: string;
};

const FILTERABLE_COLUMN_IDS = new Set([
  "employeeName",
  "email",
  "department",
  "role",
  "salary",
  "licensesUsed",
  "status",
  "joinDate",
]);

const FilterIcon = ({ active }: { active: boolean }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className={`h-4 w-4 ${active ? "text-black" : "text-gray-500"}`}
    fill="currentColor"
  >
    <path d="M3 5a1 1 0 0 1 1-1h16a1 1 0 0 1 .78 1.63L14 14.1V19a1 1 0 0 1-.45.83l-3 2A1 1 0 0 1 9 21v-6.9L3.22 5.63A1 1 0 0 1 3 5Z" />
  </svg>
);

const SortIcon = ({ active, direction }: { active: boolean; direction: "up" | "down" }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 10 6"
    className={`h-2.5 w-2.5 ${active ? "text-black" : "text-gray-300"}`}
    fill="currentColor"
  >
    {direction === "up" ? (
      <path d="M5 0 10 6H0L5 0Z" />
    ) : (
      <path d="M5 6 0 0h10L5 6Z" />
    )}
  </svg>
);

const EmployeeTable = () => {
  const dispatch = useDispatch();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>([]);
  const [openFilterColumnId, setOpenFilterColumnId] =
    useState<string | null>(null);
  const [editingRowId, setEditingRowId] =
    useState<number | null>(null);
  const [, setEditingField] = useState<string | null>(null);

  const [editedData, setEditedData] =
    useState<EditableEmployee>({});
  const editedDataRef = useRef<EditableEmployee>(editedData);

  const [originalRowData, setOriginalRowData] =
    useState<Employee | null>(null);

  // Track per-row last saved state so Undo is available only after a save.
  const [savedHistory, setSavedHistory] =
    useState<Record<number, Employee>>({});
  const employees = useSelector(getEmployees);
  const departmentOptions = useMemo(
    () =>
      Array.from(
        new Set(
          employees.map((employee) => employee.department)
        )
      ).sort(),
    [employees]
  );

  const handleEdit = useCallback((row: Employee) => {
    setEditingRowId(row.id);

    setEditedData(row);
    editedDataRef.current = row;

    setOriginalRowData(row);
  }, []);

  const handleInputChange = useCallback((
    field: keyof Employee,
    value: string | number
  ) => {
    setEditedData((prev) => {
      const next = { ...prev, [field]: value };
      editedDataRef.current = next;
      return next;
    });
  }, []);

  const handleSave = useCallback((id: number) => {
    const prevEmployee = employees.find(
      (employee) => employee.id === id
    );

    if (prevEmployee) {
      setSavedHistory((prev) => ({ ...prev, [id]: prevEmployee }));
    }

    const updatedEmployees = employees.map((employee) =>
      employee.id === id
        ? ({ ...employee, ...editedDataRef.current } as Employee)
        : employee
    );

    dispatch(setEmployees(updatedEmployees));

    setEditingRowId(null);
    setEditingField(null);
  }, [dispatch, employees]);

  const handleCancel = useCallback(() => {
    if (originalRowData) {
      setEditedData(originalRowData);
      editedDataRef.current = originalRowData;
    }

    setEditingRowId(null);
    setEditingField(null);
  }, [originalRowData]);

  const handleUndo = useCallback((id: number) => {
    const lastSaved = savedHistory[id];

    if (!lastSaved) return;

    const updatedEmployees = employees.map((employee) =>
      employee.id === id ? lastSaved : employee
    );

    dispatch(setEmployees(updatedEmployees));

    setSavedHistory((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, [dispatch, employees, savedHistory]);

  const memoizedColumns = useMemo(
    () =>
      columns(
        editingRowId,
        editedDataRef,
        handleInputChange,
        handleEdit,
        handleSave,
        handleCancel,
        handleUndo,
        setEditingField,
        savedHistory
      ),
    [
      editingRowId,
      handleCancel,
      handleEdit,
      handleInputChange,
      handleSave,
      handleUndo,
      savedHistory,
    ]
  );
  const table = useReactTable({
    data: employees,
    columns: memoizedColumns,
    state: {
      sorting,
      columnFilters,
    },

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const updateSalaryFilter = (
    column: Column<Employee, unknown>,
    min: string,
    max: string
  ) => {
    const nextMin = min.trim();
    const nextMax = max.trim();

    column.setFilterValue(
      nextMin || nextMax ? { min: nextMin, max: nextMax } : undefined
    );
  };

  const renderColumnFilter = (column: Column<Employee, unknown>) => {
    const columnId = column.id;
    const filterValue = column.getFilterValue();
    const inputClasses =
      "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black";

    if (columnId === "department") {
      return (
        <select
          value={(filterValue as string | undefined) ?? ""}
          onChange={(event) =>
            column.setFilterValue(event.target.value || undefined)
          }
          className={inputClasses}
        >
          <option value="">All departments</option>
          {departmentOptions.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      );
    }

    if (columnId === "status") {
      return (
        <select
          value={(filterValue as string | undefined) ?? ""}
          onChange={(event) =>
            column.setFilterValue(event.target.value || undefined)
          }
          className={inputClasses}
        >
          <option value="">All status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      );
    }

    if (columnId === "salary") {
      const salaryFilter = (filterValue ?? {}) as SalaryFilterValue;

      return (
        <div className="grid gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min salary"
            value={salaryFilter.min ?? ""}
            onChange={(event) =>
              updateSalaryFilter(
                column,
                event.target.value,
                salaryFilter.max ?? ""
              )
            }
            className={inputClasses}
          />
          <input
            type="number"
            min="0"
            placeholder="Max salary"
            value={salaryFilter.max ?? ""}
            onChange={(event) =>
              updateSalaryFilter(
                column,
                salaryFilter.min ?? "",
                event.target.value
              )
            }
            className={inputClasses}
          />
        </div>
      );
    }

    if (columnId === "joinDate") {
      return (
        <input
          type="date"
          value={(filterValue as string | undefined) ?? ""}
          onChange={(event) =>
            column.setFilterValue(event.target.value || undefined)
          }
          className={inputClasses}
        />
      );
    }

    return (
      <input
        type={columnId === "licensesUsed" ? "number" : "text"}
        min={columnId === "licensesUsed" ? "0" : undefined}
        placeholder="Filter column"
        value={(filterValue as string | number | undefined) ?? ""}
        onChange={(event) =>
          column.setFilterValue(event.target.value || undefined)
        }
        className={inputClasses}
      />
    );
  };

  const rows = table.getRowModel().rows;

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  return (
    <div className="p-5">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow">
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: gridTemplate,
          }}
          className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm"
        >
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => {
              const sorted = header.column.getIsSorted();
              const hasFilter = FILTERABLE_COLUMN_IDS.has(header.column.id);
              const filterOpen = openFilterColumnId === header.column.id;
              const filterActive =
                header.column.getFilterValue() !== undefined;

              return (
                <div
                  key={header.id}
                  className="relative flex min-w-0 items-center gap-2 px-4 py-5 text-sm font-bold text-gray-800 transition-all hover:bg-gray-50"
                >
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                  >
                    <span className="truncate">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </span>

                    <span className="flex flex-col leading-none">
                      <SortIcon active={sorted === "asc"} direction="up" />
                      <span className="mt-0.5">
                        <SortIcon active={sorted === "desc"} direction="down" />
                      </span>
                    </span>
                  </button>

                  {hasFilter && (
                    <>
                      <button
                        type="button"
                        title="Filter column"
                        aria-label={`Filter ${header.column.id}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenFilterColumnId((current) =>
                            current === header.column.id
                              ? null
                              : header.column.id
                          );
                        }}
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-md transition hover:bg-gray-100 ${filterActive
                          ? "bg-gray-100 text-black"
                          : "text-gray-500"
                          }`}
                      >
                        <FilterIcon active={filterActive} />
                      </button>

                      {filterOpen && (
                        <div
                          onClick={(event) => event.stopPropagation()}
                          className="absolute right-2 top-14 z-30 w-56 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
                        >
                          {renderColumnFilter(header.column)}

                          <button
                            type="button"
                            onClick={() => {
                              header.column.setFilterValue(undefined);
                              setOpenFilterColumnId(null);
                            }}
                            className="mt-3 w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Virtualized Body */}
        <div
          ref={parentRef}
          className="overflow-auto"
          style={{
            height: "600px",
          }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];

              return (
                <div
                  key={row.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                    display: "grid",
                    gridTemplateColumns: gridTemplate,
                  }}
                  className="border-b bg-white hover:bg-gray-50 items-center"
                >
                  {row.getVisibleCells().map((cell) => (
                    <div
                      key={cell.id}
                      className="px-4 py-4 text-sm text-gray-700"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTable;
