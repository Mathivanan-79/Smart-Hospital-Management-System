import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/audit-logs");

      setLogs(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
      setError(
        err.response?.status === 403
          ? "Access denied. Only administrators can view audit logs."
          : "Unable to load audit logs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesSearch = [
        log.username,
        log.action,
        log.entityType,
        log.description,
        log.entityId,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );

      const matchesAction =
        actionFilter === "ALL" || log.action === actionFilter;

      const matchesEntity =
        entityFilter === "ALL" || log.entityType === entityFilter;

      return matchesSearch && matchesAction && matchesEntity;
    });
  }, [logs, search, actionFilter, entityFilter]);

  const actions = useMemo(
    () => [...new Set(logs.map((log) => log.action).filter(Boolean))],
    [logs]
  );

  const entities = useMemo(
    () => [...new Set(logs.map((log) => log.entityType).filter(Boolean))],
    [logs]
  );

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const actionStyle = (action) => {
    const styles = {
      CREATE: "bg-emerald-100 text-emerald-700",
      UPDATE: "bg-blue-100 text-blue-700",
      DELETE: "bg-red-100 text-red-700",
      LOGIN: "bg-violet-100 text-violet-700",
      LOGOUT: "bg-slate-100 text-slate-700",
    };

    return styles[action] || "bg-amber-100 text-amber-700";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              SYSTEM MANAGEMENT
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Audit Logs
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Monitor and review activities recorded in the hospital system.
            </p>
          </div>

          <button
            onClick={fetchAuditLogs}
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "↻ Refresh Logs"}
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Audit Logs
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {logs.length}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              All recorded activities
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Create Operations
            </p>

            <p className="mt-3 text-3xl font-bold text-emerald-600">
              {logs.filter((log) => log.action === "CREATE").length}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Recorded creation events
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Update Operations
            </p>

            <p className="mt-3 text-3xl font-bold text-blue-600">
              {logs.filter((log) => log.action === "UPDATE").length}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Recorded modification events
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="audit-search"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Search logs
              </label>

              <input
                id="audit-search"
                type="text"
                placeholder="Username, description, entity ID..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="action-filter"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Filter by action
              </label>

              <select
                id="action-filter"
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="ALL">All actions</option>

                {actions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="entity-filter"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Filter by entity
              </label>

              <select
                id="entity-filter"
                value={entityFilter}
                onChange={(event) => setEntityFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="ALL">All entities</option>

                {entities.map((entity) => (
                  <option key={entity} value={entity}>
                    {entity}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Audit logs table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Activity History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredLogs.length} of {logs.length} records
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              Loading audit logs...
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <p className="font-medium text-red-600">{error}</p>

              <button
                onClick={fetchAuditLogs}
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-semibold text-slate-700">
                No audit logs found
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filter settings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">ID</th>
                    <th className="px-5 py-4 font-semibold">User</th>
                    <th className="px-5 py-4 font-semibold">Action</th>
                    <th className="px-5 py-4 font-semibold">Entity</th>
                    <th className="px-5 py-4 font-semibold">Description</th>
                    <th className="px-5 py-4 font-semibold">Date & Time</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium text-slate-700">
                        #{log.id}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-900">
                          {log.username || "Unknown"}
                        </span>

                        <p className="mt-1 text-xs text-slate-400">
                          User ID: {log.userId ?? "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${actionStyle(log.action)}`}
                        >
                          {log.action || "UNKNOWN"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {log.entityType || "—"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Entity ID: {log.entityId ?? "—"}
                        </p>
                      </td>

                      <td className="max-w-xs whitespace-normal px-5 py-4 text-slate-600">
                        {log.description || "No description"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400">
          Audit history is displayed from the records returned by the backend.
        </p>
      </div>
    </div>
  );
}