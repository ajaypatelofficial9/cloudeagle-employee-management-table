import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import type { SortingState } from "@tanstack/react-table";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { columns } from "./columns";
import { getEmployees, setEmployees } from "../../../redux/Employee/index.slice";

const gridTemplate =
  "180px 250px 180px 220px 140px 140px 140px 180px 180px";

const EmployeeTable = () => {
  const dispatch = useDispatch();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingRowId, setEditingRowId] =
    useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);

  const [editedData, setEditedData] = useState<any>({});
  const editedDataRef = useRef<any>(editedData);

  const [originalRowData, setOriginalRowData] =
    useState<any>(null);

  // Track per-row last saved state so Undo is available only after a save
  const [savedHistory, setSavedHistory] =
    useState<Record<number, any>>({});
  const employees = useSelector(getEmployees);

  const handleEdit = (row: any) => {
    setEditingRowId(row.id);

    setEditedData(row);
    editedDataRef.current = row;

    setOriginalRowData(row);
  };

  const handleInputChange = (
    field: string,
    value: string | number
  ) => {
    setEditedData((prev: any) => {
      const next = { ...prev, [field]: value };
      editedDataRef.current = next;
      return next;
    });
  };

  const handleSave = (id: number) => {
    // store the current employee state as last-saved source for undo
    const prevEmployee = employees.find(
      (e: any) => e.id === id
    );

    if (prevEmployee) {
      setSavedHistory((prev) => ({ ...prev, [id]: prevEmployee }));
    }

    const updatedEmployees = employees.map((employee: any) =>
      employee.id === id ? { ...editedDataRef.current } : employee
    );

    dispatch(setEmployees(updatedEmployees));

    setEditingRowId(null);
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditedData(originalRowData);
    editedDataRef.current = originalRowData;

    setEditingRowId(null);
    setEditingField(null);
  };

  const handleUndo = (id: number) => {
    const lastSaved = savedHistory[id];

    if (!lastSaved) return;

    const updatedEmployees = employees.map((employee: any) =>
      employee.id === id ? lastSaved : employee
    );

    dispatch(setEmployees(updatedEmployees));

    // remove history after undo
    setSavedHistory((prev) => {
      const copy = { ...prev } as Record<number, any>;
      delete copy[id];
      return copy;
    });
  };
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
        editingField,
        setEditingField,
        savedHistory
      ),
    [editingRowId, savedHistory]
  );
  const table = useReactTable({
    data: employees,
    columns: memoizedColumns,
    state: {
      sorting,
      globalFilter,
    },

    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });


  const rows = table.getRowModel().rows;

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  const visibleRows =
    editingRowId !== null
      ? rows
      : virtualizer.getVirtualItems().map(
        (virtualRow) => rows[virtualRow.index]
      );

  return (
    <div className="p-5">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow">

        {/* Filters Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-gray-50 p-4">

          {/* Search */}
          <input
            type="text"
            placeholder="Search employees..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-72 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-black"
          />

          <div className="flex items-center gap-3">

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                const value = e.target.value;

                setStatusFilter(value);

                table
                  .getColumn("status")
                  ?.setFilterValue(value || undefined);
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setGlobalFilter("");
                setStatusFilter("");

                table.resetColumnFilters();
              }}
              className="rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800"
            >
              Clear Filters
            </button>
          </div>
        </div>
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

              return (
                <div
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="flex cursor-pointer items-center gap-2 px-4 py-5 text-sm font-bold text-gray-800 transition-all hover:bg-gray-50"
                >
                  <span>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </span>

                  <div className="flex flex-col leading-none">
                    <span
                      className={`text-[10px] ${sorted === "asc"
                        ? "text-black"
                        : "text-gray-300"
                        }`}
                    >
                      ▲
                    </span>

                    <span
                      className={`text-[10px] -mt-1 ${sorted === "desc"
                        ? "text-black"
                        : "text-gray-300"
                        }`}
                    >
                      ▼
                    </span>
                  </div>
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