import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = {
  username: "",
  email: "",
  password: "",
  departmentId: "",
  fullName: "",
  specialization: "",
  qualification: "",
  experienceYears: 0,
  phone: "",
};

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [doctorResponse, departmentResponse] = await Promise.all([
        api.get("/api/doctors"),
        api.get("/api/departments"),
      ]);

      setDoctors(
        Array.isArray(doctorResponse.data) ? doctorResponse.data : []
      );

      setDepartments(
        Array.isArray(departmentResponse.data)
          ? departmentResponse.data
          : []
      );
    } catch (err) {
      console.error("Failed to load doctors:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load doctors. Please check your backend and login session."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
    setEditingDoctor(null);
    setSelectedDoctor(null);
    setSuccess("");
    setError("");
    setShowForm(true);
  };

  const openEditForm = (doctor) => {
    setForm({
      username: doctor.username || "",
      email: doctor.email || "",
      password: "",
      departmentId: String(doctor.departmentId || ""),
      fullName: doctor.fullName || "",
      specialization: doctor.specialization || "",
      qualification: doctor.qualification || "",
      experienceYears: doctor.experienceYears ?? 0,
      phone: doctor.phone || "",
    });

    setEditingDoctor(doctor);
    setSelectedDoctor(null);
    setSuccess("");
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingDoctor) {
        // The existing update endpoint uses DoctorRequest,
        // which identifies the doctor using userId.
        const payload = {
          userId: editingDoctor.userId,
          departmentId: Number(form.departmentId),
          fullName: form.fullName.trim(),
          specialization: form.specialization.trim(),
          qualification: form.qualification.trim(),
          experienceYears: Number(form.experienceYears),
          phone: form.phone.trim(),
        };

        await api.put(`/api/doctors/${editingDoctor.id}`, payload);

        setSuccess("Doctor details updated successfully.");
      } else {
        // Creates the DOCTOR user account and doctor profile together.
        const payload = {
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          departmentId: Number(form.departmentId),
          fullName: form.fullName.trim(),
          specialization: form.specialization.trim(),
          qualification: form.qualification.trim(),
          experienceYears: Number(form.experienceYears),
          phone: form.phone.trim(),
        };

        await api.post("/api/doctors", payload);

        setSuccess("Doctor account and profile created successfully.");
      }

      setShowForm(false);
      setEditingDoctor(null);
      setForm(emptyForm);

      await loadData();
    } catch (err) {
      console.error("Doctor save failed:", err);

      const responseData = err.response?.data;

      setError(
        responseData?.message ||
          responseData?.error ||
          (typeof responseData === "string" ? responseData : null) ||
          "Unable to save doctor. Please verify the form and backend logs."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (doctor) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Dr. ${doctor.fullName}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/api/doctors/${doctor.id}`);

      setSuccess("Doctor profile deleted successfully.");
      await loadData();
    } catch (err) {
      console.error("Doctor deletion failed:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete this doctor. Check whether related records prevent deletion."
      );
    }
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const searchText = search.toLowerCase();

    return [
      doctor.fullName,
      doctor.username,
      doctor.email,
      doctor.specialization,
      doctor.departmentName,
      doctor.qualification,
    ].some((value) =>
      String(value || "").toLowerCase().includes(searchText)
    );
  });

  const closeForm = () => {
    setShowForm(false);
    setEditingDoctor(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-900 sm:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-medium text-gray-500">
            HOSPITAL MANAGEMENT / STAFF
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Doctors Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage doctor profiles, departments and professional information.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
        >
          + Add Doctor
        </button>
      </div>

      {/* Notifications */}
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

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Doctors</p>
          <p className="mt-3 text-3xl font-bold">{doctors.length}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Departments</p>
          <p className="mt-3 text-3xl font-bold">{departments.length}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Specialisations</p>
          <p className="mt-3 text-3xl font-bold">
            {new Set(
              doctors.map((doctor) => doctor.specialization).filter(Boolean)
            ).size}
          </p>
        </div>
      </div>

      {/* Doctors table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">Doctor Directory</h2>
            <p className="mt-1 text-sm text-gray-500">
              View and manage registered doctors.
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search doctors..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-700 sm:w-72"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Loading doctors...
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-gray-700">No doctors found</p>
            <p className="mt-2 text-sm text-gray-500">
              Add a doctor or try another search term.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4">Doctor</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Specialisation</th>
                  <th className="px-5 py-4">Experience</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredDoctors.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-700">
                          {(doctor.fullName || "D")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold">
                            {doctor.fullName}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {doctor.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {doctor.departmentName || "Not assigned"}
                    </td>

                    <td className="px-5 py-4">
                      {doctor.specialization}
                    </td>

                    <td className="px-5 py-4">
                      {doctor.experienceYears} years
                    </td>

                    <td className="px-5 py-4">
                      {doctor.phone || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setSelectedDoctor(doctor)}
                          className="font-medium text-gray-700 hover:text-black"
                        >
                          View
                        </button>

                        <button
                          onClick={() => openEditForm(doctor)}
                          className="font-medium text-blue-700 hover:text-blue-900"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(doctor)}
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
          Showing {filteredDoctors.length} of {doctors.length} doctors
        </div>
      </div>

      {/* Add/Edit Doctor modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-auto max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-5">
              <div>
                <h2 className="text-xl font-bold">
                  {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingDoctor
                    ? "Update the doctor's professional information."
                    : "Create a login account and doctor profile."}
                </p>
              </div>

              <button
                onClick={closeForm}
                className="text-2xl text-gray-500 hover:text-black"
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-5">
              {!editingDoctor && (
                <section>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
                    Login Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      label="Username"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      required
                      minLength={3}
                    />

                    <FormField
                      label="Email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />

                    <FormField
                      label="Password"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                </section>
              )}

              <section>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
                  Professional Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="Full Name"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Dr. Arun Kumar"
                    required
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Department <span className="text-red-500">*</span>
                    </label>

                    <select
                      name="departmentId"
                      value={form.departmentId}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-700"
                    >
                      <option value="">Select department</option>

                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </select>

                    {departments.length === 0 && (
                      <p className="mt-1 text-xs text-red-600">
                        No departments available. Check the Department API.
                      </p>
                    )}
                  </div>

                  <FormField
                    label="Specialisation"
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    placeholder="Cardiology"
                    required
                  />

                  <FormField
                    label="Qualification"
                    name="qualification"
                    value={form.qualification}
                    onChange={handleChange}
                    placeholder="MBBS, MD"
                    required
                  />

                  <FormField
                    label="Experience (years)"
                    name="experienceYears"
                    type="number"
                    value={form.experienceYears}
                    onChange={handleChange}
                    min={0}
                    required
                  />

                  <FormField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                  />
                </div>
              </section>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-gray-200 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || departments.length === 0}
                  className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingDoctor
                      ? "Update Doctor"
                      : "Create Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor details modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-auto w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <h2 className="text-xl font-bold">Doctor Details</h2>

              <button
                onClick={() => setSelectedDoctor(null)}
                className="text-2xl text-gray-500 hover:text-black"
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="mt-1 font-semibold">
                  {selectedDoctor.fullName}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Detail
                  label="Username"
                  value={selectedDoctor.username}
                />
                <Detail label="Email" value={selectedDoctor.email} />
                <Detail
                  label="Department"
                  value={selectedDoctor.departmentName}
                />
                <Detail
                  label="Specialisation"
                  value={selectedDoctor.specialization}
                />
                <Detail
                  label="Qualification"
                  value={selectedDoctor.qualification}
                />
                <Detail
                  label="Experience"
                  value={`${selectedDoctor.experienceYears} years`}
                />
                <Detail label="Phone" value={selectedDoctor.phone} />
                <Detail label="Doctor ID" value={selectedDoctor.id} />
              </div>
            </div>

            <div className="border-t border-gray-200 p-5 text-right">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  minLength,
  placeholder,
  autoComplete,
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        min={min}
        minLength={minLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-700"
      />
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 break-words font-medium">{value || "—"}</p>
    </div>
  );
}