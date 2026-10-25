import { useEffect, useState } from "react";
import {
  Users as UsersIcon,
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  LockKeyhole,
} from "lucide-react";

import api from "../services/api";

const EMPTY_FORM = {
  username: "",
  email: "",
  password: "",
  role: "PATIENT",
  active: true,
};

const ROLES = ["ADMIN", "DOCTOR", "PATIENT", "RECEPTIONIST"];

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/users");

      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);

      setError(
        err.response?.status === 403
          ? "Access denied. Only an authorised administrator can manage users."
          : err.response?.status === 401
          ? "Your session has expired. Please log in again."
          : "Unable to load users. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingUser(null);
    setFormData(EMPTY_FORM);
    setError("");
    setMessage("");
    setModalOpen(true);
  }

  function openEditModal(user) {
    setEditingUser(user);

    setFormData({
      username: user.username || "",
      email: user.email || "",
      password: "",
      role: user.role || "PATIENT",
      active: user.active ?? true,
    });

    setError("");
    setMessage("");
    setModalOpen(true);
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (editingUser) {
        // Password is not sent in the update request.
        // The update DTO determines the supported update fields.
        const { password, ...updateData } = formData;

        await api.put(
          `/api/users/${editingUser.id}`,
          updateData
        );

        setMessage("User updated successfully.");
      } else {
        await api.post("/api/users", formData);

        setMessage("User created successfully.");
      }

      setModalOpen(false);
      await fetchUsers();
    } catch (err) {
      console.error("Failed to save user:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to save user. Check the required fields and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the user "${user.username}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api.delete(`/api/users/${user.id}`);

      setMessage("User deleted successfully.");
      await fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete this user."
      );
    }
  }

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();

    return (
      (user.username || "").toLowerCase().includes(query) ||
      (user.email || "").toLowerCase().includes(query) ||
      (user.role || "").toLowerCase().includes(query)
    );
  });

  const activeCount = users.filter((user) => user.active).length;
  const inactiveCount = users.length - activeCount;

  function roleStyle(role) {
    switch (role) {
      case "ADMIN":
        return "bg-violet-50 text-violet-700";
      case "DOCTOR":
        return "bg-blue-50 text-blue-700";
      case "RECEPTIONIST":
        return "bg-amber-50 text-amber-700";
      default:
        return "bg-emerald-50 text-emerald-700";
    }
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
            <UsersIcon size={15} />
            Administration
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            User Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage hospital accounts, access roles and account status.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span>{message}</span>
          <button onClick={() => setMessage("")} aria-label="Dismiss message">
            <X size={17} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>
            {typeof error === "string"
              ? error
              : "The operation failed. Please check the form and try again."}
          </span>
          <button onClick={() => setError("")} aria-label="Dismiss error">
            <X size={17} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          title="Total Users"
          value={users.length}
          icon={<UsersIcon size={22} />}
          iconClass="bg-blue-50 text-blue-600"
          loading={loading}
        />

        <StatCard
          title="Active Accounts"
          value={activeCount}
          icon={<UserCheck size={22} />}
          iconClass="bg-emerald-50 text-emerald-600"
          loading={loading}
        />

        <StatCard
          title="Inactive Accounts"
          value={inactiveCount}
          icon={<UserX size={22} />}
          iconClass="bg-orange-50 text-orange-600"
          loading={loading}
        />
      </div>

      {/* User directory */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              User Directory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and manage registered accounts.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:w-64"
              />
            </div>

            <button
              onClick={fetchUsers}
              disabled={loading}
              title="Refresh users"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <UsersIcon className="mx-auto mb-3 text-slate-300" size={36} />

            <p className="font-semibold text-slate-700">
              No users found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try a different search or add a new user.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "User",
                    "Email",
                    "Role",
                    "Account Status",
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
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700">
                          {(user.username || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {user.username || "—"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            ID: {user.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail size={15} className="text-slate-400" />
                        {user.email || "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleStyle(
                          user.role
                        )}`}
                      >
                        {user.role || "UNKNOWN"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                          user.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.active ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          title="Edit user"
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(user)}
                          title="Delete user"
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </section>

      {/* Create/Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
            className="my-6 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2
                  id="user-modal-title"
                  className="text-xl font-bold text-slate-900"
                >
                  {editingUser ? "Edit User" : "Create User"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingUser
                    ? "Update the account information."
                    : "Register a new hospital account."}
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Username
                </label>

                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="user@hospital.com"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      placeholder="At least 8 characters"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Role
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {editingUser && (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="h-4 w-4 accent-blue-600"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Account active
                    </span>

                    <span className="mt-1 block text-xs text-slate-500">
                      Allow this account to remain active.
                    </span>
                  </span>
                </label>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {typeof error === "string"
                    ? error
                    : "Unable to save the user. Check the entered details."}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                    ? "Save Changes"
                    : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, iconClass, loading }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          {icon}
        </div>
      </div>

      <p className="mt-5 text-3xl font-bold text-slate-900">
        {loading ? "—" : value.toLocaleString("en-IN")}
      </p>

      <p className="mt-2 text-xs text-slate-400">
        Registered hospital accounts
      </p>
    </div>
  );
}

export default Users;