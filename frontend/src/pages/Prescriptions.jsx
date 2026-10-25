import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  Plus,
  Search,
  Eye,
  X,
  Pill,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";

const initialForm = {
  doctorId: "",
  patientId: "",
  prescriptionDate: new Date().toISOString().split("T")[0],
  notes: "",
};

function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [prescriptionResponse, doctorResponse, patientResponse] =
        await Promise.all([
          api.get("/api/prescriptions"),
          api.get("/api/doctors"),
          api.get("/api/patients"),
        ]);

      setPrescriptions(
        Array.isArray(prescriptionResponse.data)
          ? prescriptionResponse.data
          : []
      );

      setDoctors(
        Array.isArray(doctorResponse.data) ? doctorResponse.data : []
      );

      setPatients(
        Array.isArray(patientResponse.data) ? patientResponse.data : []
      );
    } catch (err) {
      console.error("Failed to load prescription data:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load prescriptions. Check your backend and API permissions."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredPrescriptions = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return prescriptions;

    return prescriptions.filter((prescription) => {
      const values = [
        prescription.id,
        prescription.patientName,
        prescription.doctorName,
        prescription.patient?.name,
        prescription.doctor?.name,
        prescription.notes,
        prescription.prescriptionDate,
      ];

      return values.some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );
    });
  }, [prescriptions, search]);

  const today = new Date().toISOString().split("T")[0];

  const todayCount = prescriptions.filter(
    (prescription) => prescription.prescriptionDate === today
  ).length;

  function openCreateModal() {
    setForm({
      ...initialForm,
      prescriptionDate: today,
    });

    setShowModal(true);
  }

  function closeCreateModal() {
    if (saving) return;

    setShowModal(false);
    setForm(initialForm);
  }

  async function handleCreatePrescription(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        doctorId: Number(form.doctorId),
        patientId: Number(form.patientId),
        prescriptionDate: form.prescriptionDate,
        notes: form.notes.trim(),
      };

      const response = await api.post("/api/prescriptions", payload);

      setPrescriptions((previous) => [
        response.data,
        ...previous,
      ]);

      setShowModal(false);
      setForm(initialForm);
    } catch (err) {
      console.error("Failed to create prescription:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create prescription. Verify the required backend fields and your permissions."
      );
    } finally {
      setSaving(false);
    }
  }

  function getPatientName(prescription) {
    return (
      prescription.patientName ||
      prescription.patient?.name ||
      prescription.patient?.fullName ||
      `Patient #${prescription.patientId ?? prescription.patient?.id ?? "—"}`
    );
  }

  function getDoctorName(prescription) {
    return (
      prescription.doctorName ||
      prescription.doctor?.name ||
      prescription.doctor?.fullName ||
      `Doctor #${prescription.doctorId ?? prescription.doctor?.id ?? "—"}`
    );
  }

  function getDisplayDate(date) {
    if (!date) return "—";

    const parsedDate = new Date(`${date}T00:00:00`);

    return Number.isNaN(parsedDate.getTime())
      ? date
      : parsedDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
            <Activity size={16} />
            Hospital Management
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Prescription Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage patient prescriptions and medication records.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Prescription
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <div className="flex-1">
            <p>{error}</p>
          </div>

          <button
            onClick={() => setError("")}
            className="rounded-lg p-1 hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Prescriptions"
          value={prescriptions.length}
          description="All recorded prescriptions"
          icon={<ClipboardList size={22} />}
          iconStyle="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Issued Today"
          value={todayCount}
          description="Prescriptions dated today"
          icon={<CalendarDays size={22} />}
          iconStyle="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Search Results"
          value={filteredPrescriptions.length}
          description="Matching prescriptions"
          icon={<Pill size={22} />}
          iconStyle="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Prescription table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Prescription Directory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and search prescription records.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search prescriptions..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
              />
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Prescription ID</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    Loading prescriptions...
                  </td>
                </tr>
              ) : filteredPrescriptions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <ClipboardList size={27} />
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-800">
                      No prescriptions found
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {search
                        ? "Try another search term."
                        : "Create a prescription to get started."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPrescriptions.map((prescription) => (
                  <tr
                    key={prescription.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-blue-600">
                        RX-{String(prescription.id).padStart(4, "0")}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">
                        {getPatientName(prescription)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">
                        {getDoctorName(prescription)}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {getDisplayDate(prescription.prescriptionDate)}
                    </td>

                    <td className="max-w-xs px-6 py-4">
                      <p className="truncate text-sm text-slate-600">
                        {prescription.notes || "No notes"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          setSelectedPrescription(prescription)
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
          Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
        </div>
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Create Prescription
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the patient and doctor details.
                </p>
              </div>

              <button
                onClick={closeCreateModal}
                disabled={saving}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Patient <span className="text-red-500">*</span>
                </label>

                <select
                  required
                  value={form.patientId}
                  onChange={(event) =>
                    setForm({ ...form, patientId: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a patient</option>

                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.fullName ||
                        patient.name ||
                        patient.patientName ||
                        `Patient #${patient.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Doctor <span className="text-red-500">*</span>
                </label>

                <select
                  required
                  value={form.doctorId}
                  onChange={(event) =>
                    setForm({ ...form, doctorId: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a doctor</option>

                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.fullName ||
                        doctor.name ||
                        doctor.doctorName ||
                        `Doctor #${doctor.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Prescription Date <span className="text-red-500">*</span>
                </label>

                <input
                  type="date"
                  required
                  value={form.prescriptionDate}
                  max={today}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      prescriptionDate: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  rows="4"
                  value={form.notes}
                  onChange={(event) =>
                    setForm({ ...form, notes: event.target.value })
                  }
                  placeholder="Enter additional prescription notes..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {patients.length === 0 || doctors.length === 0 ? (
                <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                  Ensure at least one patient and one doctor exist before
                  creating a prescription.
                </p>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    patients.length === 0 ||
                    doctors.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription details modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Prescription Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  RX-{String(selectedPrescription.id).padStart(4, "0")}
                </h2>
              </div>

              <button
                onClick={() => setSelectedPrescription(null)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <DetailRow
                label="Patient"
                value={getPatientName(selectedPrescription)}
              />

              <DetailRow
                label="Doctor"
                value={getDoctorName(selectedPrescription)}
              />

              <DetailRow
                label="Prescription Date"
                value={getDisplayDate(
                  selectedPrescription.prescriptionDate
                )}
              />

              <div>
                <p className="text-sm font-medium text-slate-500">Notes</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
                  {selectedPrescription.notes || "No additional notes"}
                </p>
              </div>

              
            </div>

            <div className="border-t border-slate-100 p-5 text-right">
              <button
                onClick={() => setSelectedPrescription(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
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

function StatCard({ title, value, description, icon, iconStyle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">{value}</h3>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>

        <div className={`rounded-xl p-3 ${iconStyle}`}>{icon}</div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
}

export default Prescriptions;