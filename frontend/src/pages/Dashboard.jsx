import { useEffect, useState } from "react";
import {
  Users,
  Stethoscope,
  CalendarDays,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

import api from "../services/api";

function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [patientResponse, doctorResponse, appointmentResponse] =
        await Promise.all([
          api.get("/api/patients"),
          api.get("/api/doctors"),
          api.get("/api/appointments"),
        ]);

      setPatients(
        Array.isArray(patientResponse.data)
          ? patientResponse.data
          : []
      );

      setDoctors(
        Array.isArray(doctorResponse.data)
          ? doctorResponse.data
          : []
      );

      setAppointments(
        Array.isArray(appointmentResponse.data)
          ? appointmentResponse.data
          : []
      );
    } catch (err) {
      console.error("Dashboard loading failed:", err);

      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? "Your session may have expired. Please log in again."
          : "Unable to load dashboard data. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusStyle = (status) => {
    const value = (status || "").toUpperCase();

    if (["CONFIRMED", "COMPLETED", "PAID"].includes(value)) {
      return "bg-green-100 text-green-700";
    }

    if (["CANCELLED", "REJECTED"].includes(value)) {
      return "bg-red-100 text-red-700";
    }

    return "bg-amber-100 text-amber-700";
  };

  const stats = [
    {
      title: "Total Patients",
      value: patients.length,
      icon: Users,
      iconStyle: "bg-blue-100 text-blue-600",
      cardStyle: "border-blue-100",
    },
    {
      title: "Total Doctors",
      value: doctors.length,
      icon: Stethoscope,
      iconStyle: "bg-emerald-100 text-emerald-600",
      cardStyle: "border-emerald-100",
    },
    {
      title: "Total Appointments",
      value: appointments.length,
      icon: CalendarDays,
      iconStyle: "bg-violet-100 text-violet-600",
      cardStyle: "border-violet-100",
    },
    {
      title: "Pending Appointments",
      value: appointments.filter((appointment) =>
        ["SCHEDULED", "PENDING"].includes(
          (appointment.status || "").toUpperCase()
        )
      ).length,
      icon: Clock,
      iconStyle: "bg-orange-100 text-orange-600",
      cardStyle: "border-orange-100",
    },
  ];

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = `${a.appointmentDate || ""} ${a.appointmentTime || ""}`;
    const dateB = `${b.appointmentDate || ""} ${b.appointmentTime || ""}`;

    return dateB.localeCompare(dateA);
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">
            SMART HOSPITAL MANAGEMENT
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor your hospital's activities and appointments.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={18}
            className={loading ? "animate-spin" : ""}
          />
          Refresh Data
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className={`rounded-2xl border ${stat.cardStyle} bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <div className={`rounded-xl p-3 ${stat.iconStyle}`}>
                  <Icon size={23} />
                </div>
              </div>

              <div className="mt-5">
                <h2 className="text-3xl font-bold text-slate-900">
                  {loading ? "—" : stat.value.toLocaleString("en-IN")}
                </h2>

                <p className="mt-2 text-xs text-slate-400">
                  Live data from your backend
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Appointment summary */}
      <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-100 p-3 text-green-600">
              <CheckCircle size={22} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Completed Appointments
              </p>

              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {loading
                  ? "—"
                  : appointments.filter(
                      (item) =>
                        (item.status || "").toUpperCase() === "COMPLETED"
                    ).length}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
              <Clock size={22} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Scheduled Appointments
              </p>

              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {loading
                  ? "—"
                  : appointments.filter((item) =>
                      ["SCHEDULED", "CONFIRMED"].includes(
                        (item.status || "").toUpperCase()
                      )
                    ).length}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-100 p-3 text-red-600">
              <XCircle size={22} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Cancelled Appointments
              </p>

              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {loading
                  ? "—"
                  : appointments.filter(
                      (item) =>
                        (item.status || "").toUpperCase() === "CANCELLED"
                    ).length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent appointments */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent Appointments
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Appointments recorded in your hospital system.
            </p>
          </div>

          <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            {appointments.length} total
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No appointments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Patient</th>
                  <th className="px-6 py-4 font-semibold">Doctor</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Time</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sortedAppointments.slice(0, 8).map((appointment, index) => (
                  <tr
                    key={appointment.id ?? index}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800">
                        {appointment.patientName || "Patient"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {appointment.doctorName || "Doctor"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {appointment.appointmentDate || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {appointment.appointmentTime || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          appointment.status
                        )}`}
                      >
                        {formatStatus(appointment.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer note */}
      <p className="mt-6 text-center text-xs text-slate-400">
        Smart Hospital Management System · Dashboard
      </p>
    </div>
  );
}

export default Dashboard;