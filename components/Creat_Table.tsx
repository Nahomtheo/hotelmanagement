"use client";

import { useState, useEffect } from "react";

export interface TableData {
  tableNumber: number;
  capacity: number;
  location: string;
  status: "available" | "reserved" | "occupied";
}

export interface EditableTable extends TableData {
  _id?: string;
}

const INITIAL_FORM_STATE: TableData = {
  tableNumber: 1,
  capacity: 2,
  location: "Main Dining",
  status: "available",
};

export default function TableManager() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTable, setSelectedTable] = useState<EditableTable | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tables, setTables] = useState<EditableTable[]>([]);
  const [form, setForm] = useState<TableData>(INITIAL_FORM_STATE);

  // 1. Fetch tables on mount
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await fetch("/api/restaurant/table", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setTables(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch tables:", err);
    }
  };

  // 2. Clear / Reset Form
  const resetForm = () => {
    setForm(INITIAL_FORM_STATE);
    setSelectedTable(null);
    setIsEditing(false);
  };

  // 3. Populate form for editing
  const handleEditSelect = (item: EditableTable) => {
    setSelectedTable(item);
    setIsEditing(true);
    setForm({
      tableNumber: item.tableNumber || 1,
      capacity: item.capacity || 2,
      location: item.location || "",
      status: item.status || "available",
    });
    setShowForm(true);
  };

  // Handle general changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/restaurant/table", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEditing ? { ...form, id: selectedTable?._id } : form
        ),
      });

      const data = await res.json();
      if (data.success || res.ok) {
        alert(isEditing ? "Table updated successfully!" : "Table created successfully!");
        resetForm();
        setShowForm(false);
        fetchTables();
      } else {
        alert(`Error: ${data.error || "Failed to save table"}`);
      }
    } catch (err: any) {
      console.error("Failed to submit form:", err);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper badge color helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-500/20";
      case "reserved":
        return "bg-amber-50 text-amber-700 border-amber-200/80 ring-amber-500/20";
      case "occupied":
        return "bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-500/20";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 antialiased font-sans text-slate-800">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Table Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Organize floor plans, seating capacities, and real-time availability
          </p>
        </div>
        <button
          className={`inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm ${
            showForm
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-indigo-200 shadow-lg"
          }`}
          onClick={() => {
            if (showForm) resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close Form
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Table
            </>
          )}
        </button>
      </div>

      {/* Form Container */}
      {showForm && (
        <div className="mb-10 bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-100/50 overflow-hidden transition-all duration-300">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isEditing ? "bg-amber-500" : "bg-indigo-600"}`} />
              {isEditing ? `Editing Table #${selectedTable?.tableNumber}` : "New Dining Table"}
            </h3>
            {isEditing && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-200/60">
                Edit Mode
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Table Number & Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Table Number
                </label>
                <input
                  type="number"
                  name="tableNumber"
                  value={form.tableNumber || ""}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="e.g. 12"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Capacity (Guests)
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity || ""}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="e.g. 4"
                />
              </div>
            </div>

            {/* Location & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Location / Section
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="e.g. Patio, Main Dining, VIP Room"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all capitalize"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="occupied">Occupied</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 inline-flex items-center justify-center font-medium py-3 px-5 rounded-xl text-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-50 text-white shadow-sm ${
                  isEditing
                    ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {isEditing ? "Updating..." : "Saving..."}
                  </span>
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  "Create Table"
                )}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables?.map((item: EditableTable) => (
          <div
            key={item._id || item.tableNumber}
            className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <div>
              {/* Header Visual Box */}
              <div className="relative w-full h-36 bg-gradient-to-br from-slate-50 to-slate-100/80 p-5 flex flex-col justify-between border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Table No.
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full border ring-1 capitalize ${getStatusBadge(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    #{item.tableNumber}
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Capacity
                  </span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {item.capacity} {item.capacity === 1 ? "Guest" : "Guests"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Section
                  </span>
                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md capitalize">
                    {item.location || "General"}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Action */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleEditSelect(item)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 text-xs font-semibold rounded-xl border border-slate-200/80 hover:border-amber-200/80 transition-all shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}