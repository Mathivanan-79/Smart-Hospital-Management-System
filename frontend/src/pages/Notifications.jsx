import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Notifications() {
  const { username, role } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Get the current user's ID from the backend.
  // The JWT contains username and role, but not the user ID.
  const [userId, setUserId] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
  });

  // Retrieve the authenticated user's details.
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await api.get("/api/auth/me");

      setUserId(response.data.id);
    } catch (err) {
      console.error("Unable to fetch current user:", err);

      setError(
        "Unable to identify your account. The GET /api/auth/me endpoint must be implemented in the backend."
      );

      setLoading(false);
    }
  }, []);

  // Fetch notifications belonging to the logged-in user.
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/api/notifications/user/${userId}`
      );

      const data = response.data;

      setNotifications(data);

      const unreadCount = data.filter(
        (notification) => !notification.readStatus
      ).length;

      setStats({
        total: data.length,
        unread: unreadCount,
        read: data.length - unreadCount,
      });
    } catch (err) {
      console.error("Unable to fetch notifications:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load the current user after authentication.
  useEffect(() => {
    if (username) {
      fetchCurrentUser();
    }
  }, [username, fetchCurrentUser]);

  // Load notifications after obtaining the user ID.
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  // Mark a notification as read.
  const handleMarkAsRead = async (notificationId) => {
    setUpdatingId(notificationId);
    setError("");

    try {
      await api.put(
        `/api/notifications/${notificationId}/read`
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? { ...notification, readStatus: true }
            : notification
        )
      );

      setStats((previous) => {
        const notification = notifications.find(
          (item) => item.id === notificationId
        );

        if (!notification || notification.readStatus) {
          return previous;
        }

        return {
          ...previous,
          unread: Math.max(0, previous.unread - 1),
          read: previous.read + 1,
        };
      });
    } catch (err) {
      console.error("Unable to mark notification as read:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update the notification."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Display notifications based on the selected filter.
  const filteredNotifications = notifications.filter(
    (notification) => {
      if (filter === "UNREAD") {
        return !notification.readStatus;
      }

      if (filter === "READ") {
        return notification.readStatus;
      }

      return true;
    }
  );

  // Format the notification timestamp.
  const formatDate = (dateValue) => {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Notification icon.
  const getNotificationIcon = (title = "") => {
    const value = title.toLowerCase();

    if (value.includes("appointment")) return "📅";
    if (value.includes("payment") || value.includes("bill")) return "💳";
    if (value.includes("prescription")) return "💊";
    if (value.includes("patient")) return "🧑‍⚕️";
    if (value.includes("security")) return "🔐";

    return "🔔";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-blue-600">Notifications</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Notifications
            </h1>

            <p className="mt-2 text-slate-500">
              Stay updated with important hospital activities and alerts.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchNotifications}
            disabled={!userId || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span aria-hidden="true">↻</span>
            Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* User Information */}
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
            👤
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {username || "Current User"}
            </p>

            <p className="text-xs text-slate-500">
              {role || "User"} account notifications
            </p>
          </div>

          <span className="ml-auto rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">
            {stats.unread} unread
          </span>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Total Notifications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Notifications
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                  {stats.total}
                </h2>

                <p className="mt-2 text-xs text-slate-400">
                  All notifications
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                🔔
              </div>
            </div>
          </div>

          {/* Unread Notifications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Unread
                </p>

                <h2 className="mt-3 text-3xl font-bold text-orange-600">
                  {stats.unread}
                </h2>

                <p className="mt-2 text-xs text-slate-400">
                  Require your attention
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                📩
              </div>
            </div>
          </div>

          {/* Read Notifications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Read
                </p>

                <h2 className="mt-3 text-3xl font-bold text-emerald-600">
                  {stats.read}
                </h2>

                <p className="mt-2 text-xs text-slate-400">
                  Already reviewed
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
                ✅
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Section Header */}
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent Notifications
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review and manage your notifications.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "All", value: "ALL" },
                { label: "Unread", value: "UNREAD" },
                { label: "Read", value: "READ" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    filter === item.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center px-6 py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

              <p className="mt-4 text-sm text-slate-500">
                Loading notifications...
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (

            /* Empty State */
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl">
                {filter === "UNREAD" ? "🎉" : "🔔"}
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-800">
                {filter === "UNREAD"
                  ? "You're all caught up!"
                  : filter === "READ"
                  ? "No read notifications"
                  : "No notifications yet"}
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                {filter === "UNREAD"
                  ? "You don't have any unread notifications at the moment."
                  : "Notifications about hospital activities will appear here."}
              </p>
            </div>
          ) : (

            /* Notification List */
            <div className="divide-y divide-slate-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-5 transition hover:bg-slate-50 sm:p-6 ${
                    !notification.readStatus ? "bg-blue-50/40" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">

                    {/* Icon */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${
                        notification.readStatus
                          ? "bg-slate-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {getNotificationIcon(notification.title)}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`text-sm sm:text-base ${
                            notification.readStatus
                              ? "font-semibold text-slate-700"
                              : "font-bold text-slate-900"
                          }`}
                        >
                          {notification.title}
                        </h3>

                        {!notification.readStatus && (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                            New
                          </span>
                        )}
                      </div>

                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>

                      <p className="mt-3 text-xs text-slate-400">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>

                    {/* Action */}
                    {!notification.readStatus && (
                      <button
                        type="button"
                        onClick={() =>
                          handleMarkAsRead(notification.id)
                        }
                        disabled={updatingId === notification.id}
                        className="shrink-0 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                      >
                        {updatingId === notification.id
                          ? "Updating..."
                          : "Mark as read"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {!loading && filteredNotifications.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs text-slate-500">
                Showing {filteredNotifications.length} of{" "}
                {notifications.length} notifications
              </p>
            </div>
          )}
        </div>

        {/* Information Footer */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs leading-5 text-slate-500">
            <span className="font-semibold text-slate-700">
              Note:
            </span>{" "}
            Notifications are loaded from the Smart Hospital backend.
            Marking a notification as read updates its status in the database.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Notifications;