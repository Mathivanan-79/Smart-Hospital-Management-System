import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const EMPTY_FORM = {
  patientId: "",
  doctorId: "",
  recordDate: new Date().toLocaleDateString("en-CA"),
  diagnosis: "",
  symptoms: "",
  treatment: "",
  notes: "",
};

function formatDate(date) {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [recordsResponse, patientsResponse, doctorsResponse] =
        await Promise.all([
          api.get("/api/medical-records"),
          api.get("/api/patients"),
          api.get("/api/doctors"),
        ]);

      setRecords(
        Array.isArray(recordsResponse.data) ? recordsResponse.data : []
      );

      setPatients(
        Array.isArray(patientsResponse.data) ? patientsResponse.data : []
      );

      setDoctors(
        Array.isArray(doctorsResponse.data) ? doctorsResponse.data : []
      );
    } catch (err) {
      console.error("Failed to load medical records:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load medical records. Check your backend and permissions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !query ||
        String(record.patientName || "").toLowerCase().includes(query) ||
        String(record.doctorName || "").toLowerCase().includes(query) ||
        String(record.diagnosis || "").toLowerCase().includes(query) ||
        String(record.symptoms || "").toLowerCase().includes(query) ||
        String(record.id || "").includes(query);

      const matchesDate =
        !dateFilter || record.recordDate === dateFilter;

      return matchesSearch && matchesDate;
    });
  }, [records, search, dateFilter]);

  const uniquePatients = useMemo(
    () => new Set(records.map((record) => record.patientId)).size,
    [records]
  );

  const latestRecordDate = useMemo(() => {
    if (records.length === 0) return "—";

    const latest = records
      .map((record) => record.recordDate)
      .filter(Boolean)
      .sort()
      .at(-1);

    return latest ? formatDate(latest) : "—";
  }, [records]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openCreateForm() {
    setError("");
    setSuccess("");
    setSelectedRecord(null);

    setForm({
      ...EMPTY_FORM,
      recordDate: new Date().toLocaleDateString("en-CA"),
    });

    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.patientId ||
      !form.doctorId ||
      !form.recordDate ||
      !form.diagnosis.trim()
    ) {
      setError("Please select a patient, doctor, date and diagnosis.");
      return;
    }

    const payload = {
      patientId: Number(form.patientId),
      doctorId: Number(form.doctorId),
      recordDate: form.recordDate,
      diagnosis: form.diagnosis.trim(),
      symptoms: form.symptoms.trim(),
      treatment: form.treatment.trim(),
      notes: form.notes.trim(),
    };

    setSaving(true);

    try {
      await api.post("/api/medical-records", payload);

      setSuccess("Medical record created successfully.");
      setShowForm(false);
      setForm(EMPTY_FORM);

      await loadData();
    } catch (err) {
      console.error("Failed to create medical record:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create the medical record. Verify the form fields and backend validation."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Hospital Management
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Medical Records
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Maintain patient diagnoses, symptoms and treatment history.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            + Add Medical Record
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="font-semibold"
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
              aria-label="Dismiss success"
              className="font-semibold"
            >
              ×
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Records"
            value={records.length}
            subtitle="All recorded consultations"
          />

          <StatCard
            title="Patients Recorded"
            value={uniquePatients}
            subtitle="Unique patients with medical records"
          />

          <StatCard
            title="Latest Record"
            value={latestRecordDate}
            subtitle="Most recent consultation date"
          />
        </div>

        {/* Create Form */}
        {showForm && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Create Medical Record
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the consultation details below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                  >
                    <option value="">Select patient</option>

                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.fullName ||
                          patient.name ||
                          `Patient #${patient.id}`}
                        {" — #"}
                        {patient.id}
                      </option>
                    ))}
                  </select>
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
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                  >
                    <option value="">Select doctor</option>

                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.fullName ||
                          doctor.name ||
                          `Doctor #${doctor.id}`}
                        {" — #"}
                        {doctor.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="recordDate"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Consultation Date{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="recordDate"
                    name="recordDate"
                    type="date"
                    value={form.recordDate}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="diagnosis"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Diagnosis <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="diagnosis"
                    name="diagnosis"
                    value={form.diagnosis}
                    onChange={handleChange}
                    maxLength={500}
                    required
                    placeholder="Enter diagnosis"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="symptoms"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Symptoms
                  </label>

                  <textarea
                    id="symptoms"
                    name="symptoms"
                    value={form.symptoms}
                    onChange={handleChange}
                    rows={3}
                    maxLength={2000}
                    placeholder="Describe reported symptoms"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="treatment"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Treatment
                  </label>

                  <textarea
                    id="treatment"
                    name="treatment"
                    value={form.treatment}
                    onChange={handleChange}
                    rows={3}
                    maxLength={2000}
                    placeholder="Record the treatment plan"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="notes"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Notes and Follow-up Instructions
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    maxLength={3000}
                    placeholder="Enter additional consultation notes"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
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
                  disabled={
                    saving || patients.length === 0 || doctors.length === 0
                  }
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Medical Record"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Records Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Medical History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredRecords.length} record
                {filteredRecords.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search patient, doctor, diagnosis..."
                aria-label="Search medical records"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-500 sm:w-72"
              />

              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                aria-label="Filter medical records by date"
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

              <p className="mt-4 text-sm text-slate-500">
                Loading medical records...
              </p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                +
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No medical records found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another search or create a new medical record.
              </p>

              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
              >
                Add Medical Record
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "Record",
                      "Patient",
                      "Doctor",
                      "Date",
                      "Diagnosis",
                      "Treatment",
                      "Details",
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
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-900">
                          #{record.id}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {record.patientName || "Unknown patient"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          ID: {record.patientId}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {record.doctorName || "Unknown doctor"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          ID: {record.doctorId}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {formatDate(record.recordDate)}
                      </td>

                      <td className="max-w-52 px-5 py-4">
                        <p
                          className="truncate text-sm font-medium text-slate-800"
                          title={record.diagnosis}
                        >
                          {record.diagnosis || "—"}
                        </p>
                      </td>

                      <td className="max-w-52 px-5 py-4">
                        <p
                          className="truncate text-sm text-slate-600"
                          title={record.treatment}
                        >
                          {record.treatment || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(record)}
                          className="whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredRecords.length} of {records.length} records
            </span>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="self-start font-semibold text-slate-700 hover:text-slate-950 disabled:opacity-50 sm:self-auto"
            >
              Refresh records ↻
            </button>
          </div>
        </section>
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRecord(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="record-modal-title"
            className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Medical Record #{selectedRecord.id}
                </p>

                <h2
                  id="record-modal-title"
                  className="mt-2 text-xl font-semibold text-slate-900"
                >
                  Consultation Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close details"
                className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Detail
                label="Patient"
                value={selectedRecord.patientName}
              />

              <Detail
                label="Doctor"
                value={selectedRecord.doctorName}
              />

              <Detail
                label="Consultation Date"
                value={formatDate(selectedRecord.recordDate)}
              />

              <Detail
                label="Diagnosis"
                value={selectedRecord.diagnosis}
              />

              <Detail
                label="Symptoms"
                value={selectedRecord.symptoms}
              />

              <Detail
                label="Treatment"
                value={selectedRecord.treatment}
              />

              <div className="sm:col-span-2">
                <Detail
                  label="Notes and Follow-up"
                  value={selectedRecord.notes}
                />
              </div>
            </div>

            <div className="mt-7 flex justify-end border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}