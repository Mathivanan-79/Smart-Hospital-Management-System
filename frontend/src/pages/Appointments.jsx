import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const EMPTY_FORM = {
  patientId: "",
  doctorId: "",
  appointmentDate: "",
  appointmentTime: "",
  reason: "",
};

const STATUS_OPTIONS = [
  "SCHEDULED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "PENDING",
];

const STATUS_STYLES = {
  SCHEDULED: "bg-blue-50 text-blue-700 ring-blue-600/20",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  COMPLETED: "bg-slate-100 text-slate-700 ring-slate-600/20",
  CANCELLED: "bg-red-50 text-red-700 ring-red-600/20",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

function formatStatus(status) {
  return String(status || "PENDING")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time) {
  if (!time) return "—";

  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function StatCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [appointmentResult, patientResult, doctorResult] =
        await Promise.all([
          api.get("/api/appointments"),
          api.get("/api/patients"),
          api.get("/api/doctors"),
        ]);

      setAppointments(
        Array.isArray(appointmentResult.data) ? appointmentResult.data : []
      );

      setPatients(
        Array.isArray(patientResult.data) ? patientResult.data : []
      );

      setDoctors(
        Array.isArray(doctorResult.data) ? doctorResult.data : []
      );
    } catch (err) {
      console.error("Failed to load appointment data:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load appointments. Check your backend and permissions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const statistics = useMemo(() => {
    const countStatus = (status) =>
      appointments.filter(
        (appointment) => appointment.status === status
      ).length;

    return {
      total: appointments.length,
      confirmed: countStatus("CONFIRMED"),
      pending:
        countStatus("PENDING") + countStatus("SCHEDULED"),
      completed: countStatus("COMPLETED"),
      cancelled: countStatus("CANCELLED"),
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesSearch =
        !query ||
        String(appointment.patientName || "")
          .toLowerCase()
          .includes(query) ||
        String(appointment.doctorName || "")
          .toLowerCase()
          .includes(query) ||
        String(appointment.reason || "")
          .toLowerCase()
          .includes(query) ||
        String(appointment.id || "").includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        appointment.status === statusFilter;

      const matchesDate =
        !dateFilter || appointment.appointmentDate === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, search, statusFilter, dateFilter]);

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleCreateAppointment(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.patientId ||
      !form.doctorId ||
      !form.appointmentDate ||
      !form.appointmentTime ||
      !form.reason.trim()
    ) {
      setError("Please complete all appointment fields.");
      return;
    }

    const selectedDate = new Date(`${form.appointmentDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError("Appointment date cannot be in the past.");
      return;
    }

    const payload = {
      patientId: Number(form.patientId),
      doctorId: Number(form.doctorId),
      appointmentDate: form.appointmentDate,
      appointmentTime: form.appointmentTime,
      reason: form.reason.trim(),
    };

    setSaving(true);

    try {
      await api.post("/api/appointments", payload);

      setSuccess("Appointment booked successfully.");
      setForm(EMPTY_FORM);
      setShowForm(false);

      await loadData();
    } catch (err) {
      console.error("Appointment creation failed:", err);

      setError(
        err.response?.data?.message ||
          "Failed to book appointment. Please check the selected patient, doctor and appointment details."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(appointmentId, newStatus) {
    setError("");
    setSuccess("");

    try {
      const response = await api.put(
        `/api/appointments/${appointmentId}/status`,
        { status: newStatus }
      );

      setAppointments((previous) =>
        previous.map((appointment) =>
          appointment.id === appointmentId
            ? response.data
            : appointment
        )
      );

      setSuccess(`Appointment #${appointmentId} status updated.`);
    } catch (err) {
      console.error("Status update failed:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update appointment status. Check your permissions and backend logs."
      );
    }
  }

  function openBookingForm() {
    setError("");
    setSuccess("");
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Hospital Management
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Appointments
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Schedule appointments and manage patient visits.
            </p>
          </div>

          <button
            type="button"
            onClick={openBookingForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            <span className="text-lg">+</span>
            Book Appointment
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div
            role="alert"
            className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-semibold"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="font-semibold"
              aria-label="Dismiss success"
            >
              ×
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Appointments"
            value={statistics.total}
            description="All recorded appointments"
          />

          <StatCard
            title="Confirmed"
            value={statistics.confirmed}
            description="Appointments confirmed"
          />

          <StatCard
            title="Pending"
            value={statistics.pending}
            description="Awaiting confirmation"
          />

          <StatCard
            title="Completed"
            value={statistics.completed}
            description="Completed patient visits"
          />
        </div>

        {/* Booking Form */}
        {showForm && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Book a New Appointment
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select a patient, doctor and suitable appointment time.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100"
                aria-label="Close booking form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateAppointment}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label
                    htmlFor="patientId"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Patient <span className="text-red-500">*</span>
                  </label>

                  <select
                    id="patientId"
                    name="patientId"
                    value={form.patientId}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                  >
                    <option value="">Select patient</option>

                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.fullName || patient.name || `Patient #${patient.id}`}
                        {" — #"}
                        {patient.id}
                      </option>
                    ))}
                  </select>

                  {patients.length === 0 && (
                    <p className="mt-1 text-xs text-amber-700">
                      No patients found. Create a patient first.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="doctorId"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Doctor <span className="text-red-500">*</span>
                  </label>

                  <select
                    id="doctorId"
                    name="doctorId"
                    value={form.doctorId}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                  >
                    <option value="">Select doctor</option>

                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.fullName || doctor.name || `Doctor #${doctor.id}`}
                        {" — #"}
                        {doctor.id}
                      </option>
                    ))}
                  </select>

                  {doctors.length === 0 && (
                    <p className="mt-1 text-xs text-amber-700">
                      No doctors found. Create a doctor first.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="appointmentDate"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Appointment Date{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="appointmentDate"
                    name="appointmentDate"
                    type="date"
                    min={new Date().toLocaleDateString("en-CA")}
                    value={form.appointmentDate}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="appointmentTime"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Appointment Time{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="appointmentTime"
                    name="appointmentTime"
                    type="time"
                    value={form.appointmentTime}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="reason"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Reason for Visit{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    id="reason"
                    name="reason"
                    rows={3}
                    maxLength={500}
                    value={form.reason}
                    onChange={handleFormChange}
                    required
                    placeholder="Describe the reason for the appointment"
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || patients.length === 0 || doctors.length === 0}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Appointment List */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Appointment Records
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredAppointments.length} appointment
                  {filteredAppointments.length === 1 ? "" : "s"} found
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search patient or doctor..."
                  aria-label="Search appointments"
                  className="min-w-0 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-500 sm:w-64"
                />

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by status"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                >
                  <option value="ALL">All statuses</option>

                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                  aria-label="Filter by date"
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

              <p className="mt-4 text-sm text-slate-500">
                Loading appointments...
              </p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                +
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No appointments found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your filters or book a new appointment.
              </p>

              <button
                type="button"
                onClick={openBookingForm}
                className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
              >
                Book Appointment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "Appointment",
                      "Patient",
                      "Doctor",
                      "Date & Time",
                      "Reason",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-900">
                          #{appointment.id}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {appointment.patientName || "Unknown patient"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Patient ID: {appointment.patientId}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {appointment.doctorName || "Unknown doctor"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Doctor ID: {appointment.doctorId}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {formatDate(appointment.appointmentDate)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatTime(appointment.appointmentTime)}
                        </p>
                      </td>

                      <td className="max-w-52 px-5 py-4">
                        <p
                          className="truncate text-sm text-slate-600"
                          title={appointment.reason}
                        >
                          {appointment.reason || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                            STATUS_STYLES[appointment.status] ||
                            "bg-slate-100 text-slate-700 ring-slate-600/20"
                          }`}
                        >
                          {formatStatus(appointment.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          aria-label={`Update status for appointment ${appointment.id}`}
                          value={appointment.status || "PENDING"}
                          onChange={(event) =>
                            handleStatusChange(
                              appointment.id,
                              event.target.value
                            )
                          }
                          className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-slate-500"
                        >
                          {!STATUS_OPTIONS.includes(appointment.status) &&
                            appointment.status && (
                              <option value={appointment.status}>
                                {formatStatus(appointment.status)}
                              </option>
                            )}

                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {formatStatus(status)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredAppointments.length} of {appointments.length} records
            </span>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="self-start font-semibold text-slate-700 hover:text-slate-950 disabled:opacity-50 sm:self-auto"
            >
              Refresh appointments ↻
            </button>
          </div>
        </section>

        {/* Summary */}
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            Cancelled: {statistics.cancelled}
          </span>

          <span className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            Completed: {statistics.completed}
          </span>
        </div>
      </div>
    </div>
  );
}