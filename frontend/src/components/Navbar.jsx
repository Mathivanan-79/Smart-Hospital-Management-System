import { useLocation } from "react-router-dom";

function Navbar() {

  const location = useLocation();

  const getPageTitle = () => {

    const path = location.pathname;

    if (path === "/dashboard") return "Dashboard";
    if (path === "/users") return "Users";
    if (path === "/doctors") return "Doctors";
    if (path === "/patients") return "Patients";
    if (path === "/departments") return "Departments";
    if (path === "/appointments") return "Appointments";
    if (path === "/medicines") return "Medicines";
    if (path === "/billing") return "Billing";
    if (path === "/payments") return "Payments";
    if (path === "/notifications") return "Notifications";
    if (path === "/audit-logs") return "Audit Logs";
    if (path === "/medical-records") return "Medical Records";
    if (path === "/prescriptions") return "Prescriptions";
    if (path === "/availability") return "Availability";
    if (path === "/profile") return "My Profile";

    return "Smart Hospital";
  };

  return (
    <header className="h-16 bg-white border-b border-[#e5e5e5] flex items-center justify-between px-8">

      {/* PAGE TITLE */}
      <div>

        <h1 className="text-lg font-semibold text-[#111111]">
          {getPageTitle()}
        </h1>

        <p className="text-xs text-gray-500 mt-0.5">
          Smart Hospital Management System
        </p>

      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center">

        {/* Notification */}
        <button
          className="
            relative
            w-9
            h-9
            rounded-lg
            border
            border-[#e5e5e5]
            bg-white
            hover:bg-gray-50
            flex
            items-center
            justify-center
            transition
          "
          title="Notifications"
        >

          🔔

          <span
            className="
              absolute
              -top-1
              -right-1
              w-4
              h-4
              rounded-full
              bg-black
              text-white
              text-[9px]
              flex
              items-center
              justify-center
            "
          >
            1
          </span>

        </button>

      </div>

    </header>
  );
}

export default Navbar;