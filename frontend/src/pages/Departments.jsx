import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = {
  name: "",
  description: "",
};

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const loadDepartments = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/departments");
      setDepartments(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Failed to load departments:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load departments. Check your backend and login session."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (department) => {
    setForm({
      name: department.name || "",
      description: department.description || "",
    });

    setEditingId(department.id);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
      };

      if (editingId !== null) {
        await api.put(`/api/departments/${editingId}`, payload);
        setSuccess("Department updated successfully.");
      } else {
        await api.post("/api/departments", payload);
        setSuccess("Department created successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadDepartments();
    } catch (err) {
      console.error("Failed to save department:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to save department. Check the API endpoint and required fields."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (department) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${department.name}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/api/departments/${department.id}`);
      setSuccess("Department deleted successfully.");
      await loadDepartments();
    } catch (err) {
      console.error("Failed to delete department:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete this department. It may be associated with existing doctors."
      );
    }
  };

  const filteredDepartments = departments.filter((department) => {
    const searchText = search.toLowerCase();

    return [department.name, department.description].some((value) =>
      String(value || "").toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-900 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-medium text-gray-500">
            HOSPITAL MANAGEMENT / CONFIGURATION
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Departments Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Organise hospital departments and their descriptions.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
        >
          + Add Department
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            className="font-bold"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <span>{success}</span>

          <button
            onClick={() => setSuccess("")}
            className="font-bold"
            aria-label="Dismiss success"
          >
            ×
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Departments</p>
          <p className="mt-3 text-3xl font-bold">
            {departments.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Departments Found</p>
          <p className="mt-3 text-3xl font-bold">
            {filteredDepartments.length}
          </p>
        </div>
      </div>

      {/* Directory */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">
              Department Directory
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View and manage hospital departments.
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search departments..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-700 sm:w-72"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Loading departments...
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-gray-700">
              No departments found
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Add a department or try a different search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Department Name</th>
                  <th className="px-5 py-4">Description</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredDepartments.map((department) => (
                  <tr
                    key={department.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-gray-500">
                      #{department.id}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg">
                          🏥
                        </div>

                        <span className="font-semibold">
                          {department.name}
                        </span>
                      </div>
                    </td>

                    <td className="max-w-md px-5 py-4 text-gray-600">
                      {department.description || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => openEditForm(department)}
                          className="font-medium text-blue-700 hover:text-blue-900"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(department)}
                          className="font-medium text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-gray-200 px-5 py-4 text-sm text-gray-500">
          Showing {filteredDepartments.length} of {departments.length} departments
        </div>
      </div>

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-auto w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId !== null
                    ? "Edit Department"
                    : "Add Department"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the department information below.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="text-2xl text-gray-500 hover:text-black"
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Department Name <span className="text-red-500">*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="e.g. Neurology"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-700"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={1000}
                  placeholder="Describe the department's services..."
                  className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-700"
                />
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-gray-200 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Update Department"
                      : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}