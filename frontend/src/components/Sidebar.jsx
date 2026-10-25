import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuItems = {
  ADMIN: [
    { name: "Dashboard", path: "/dashboard", icon: "▦" },
    { name: "Users", path: "/users", icon: "♙" },
    { name: "Doctors", path: "/doctors", icon: "⚕" },
    { name: "Patients", path: "/patients", icon: "♧" },
    { name: "Departments", path: "/departments", icon: "▤" },
    { name: "Appointments", path: "/appointments", icon: "▦" },
    { name: "Prescriptions", path: "/prescriptions", icon: "✚" },
    { name: "Medicines", path: "/medicines", icon: "✚" },
    { name: "Bills", path: "/bills", icon: "▣" },
    { name: "Payments", path: "/payments", icon: "₹" },
    { name: "Notifications", path: "/notifications", icon: "♢" },
    { name: "Audit Logs", path: "/audit-logs", icon: "☷" },
  ],

  DOCTOR: [
    { name: "Dashboard", path: "/dashboard", icon: "▦" },
    { name: "Appointments", path: "/appointments", icon: "▣" },
    { name: "Patients", path: "/patients", icon: "♧" },
    { name: "Medical Records", path: "/medical-records", icon: "▤" },
    { name: "Prescriptions", path: "/prescriptions", icon: "✚" },
    { name: "Availability", path: "/availability", icon: "◷" },
    { name: "Notifications", path: "/notifications", icon: "♢" },
  ],

  PATIENT: [
    { name: "Dashboard", path: "/dashboard", icon: "▦" },
    { name: "My Profile", path: "/profile", icon: "♙" },
    { name: "Appointments", path: "/appointments", icon: "▣" },
    { name: "Medical Records", path: "/medical-records", icon: "▤" },
    { name: "Prescriptions", path: "/prescriptions", icon: "✚" },
    { name: "Bills", path: "/bills", icon: "▣" },
    { name: "Payments", path: "/payments", icon: "₹" },
    { name: "Notifications", path: "/notifications", icon: "♢" },
  ],

  RECEPTIONIST: [
    { name: "Dashboard", path: "/dashboard", icon: "▦" },
    { name: "Patients", path: "/patients", icon: "♧" },
    { name: "Doctors", path: "/doctors", icon: "⚕" },
    { name: "Appointments", path: "/appointments", icon: "▣" },
    { name: "Bills", path: "/bills", icon: "▤" },
    { name: "Payments", path: "/payments", icon: "₹" },
    { name: "Notifications", path: "/notifications", icon: "♢" },
  ],
};

function Sidebar() {
  const { role, username, logout } = useAuth();

  // Normalise roles such as ROLE_ADMIN to ADMIN.
  const normalizedRole = role?.replace(/^ROLE_/, "").toUpperCase();

  const items = menuItems[normalizedRole] || [];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
      {/* Brand */}
      <div className="border-b border-slate-100 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-600/20">
            ✚
          </div>

          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              Smart Hospital
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Healthcare Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Main Menu
        </p>

        <div className="space-y-1.5">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 font-semibold text-white shadow-md shadow-blue-600/20"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`
              }
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg text-lg">
                {item.icon}
              </span>

              <span>{item.name}</span>

              <span className="ml-auto text-xs opacity-60">›</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-100 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
            {username ? username.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {username || "User"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {normalizedRole || "USER"}
            </p>
          </div>

          <span className="h-2 w-2 rounded-full bg-green-500" />
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <span className="text-lg">↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;