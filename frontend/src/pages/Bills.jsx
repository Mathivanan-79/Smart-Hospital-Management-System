import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBill, setSelectedBill] = useState(null);

  // Load bills from the backend
  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    setError("");

    try {
      // This endpoint is intended for authorised staff.
      const response = await api.get("/api/bills");

      setBills(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Failed to load bills:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to view all bills.");
      } else {
        setError("Unable to load bills. Please check the backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount ?? 0);

  // Filter bills
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const query = search.toLowerCase();

      const matchesSearch =
        String(bill.id).includes(query) ||
        String(bill.patientId).includes(query) ||
        (bill.patientName || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || bill.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bills, search, statusFilter]);

  // Calculate summary statistics
  const totalBilled = bills
    .filter((bill) => bill.status !== "CANCELLED")
    .reduce((total, bill) => total + Number(bill.totalAmount || 0), 0);

  const unpaidBills = bills.filter(
    (bill) => bill.status === "UNPAID"
  );

  const paidBills = bills.filter(
    (bill) => bill.status === "PAID"
  );

  const pendingAmount = unpaidBills.reduce(
    (total, bill) => total + Number(bill.totalAmount || 0),
    0
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";

      case "PARTIALLY_PAID":
        return "bg-yellow-100 text-yellow-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Billing Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage patient bills and monitor billing status.
            </p>
          </div>

          <button
            onClick={fetchBills}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh Bills"}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p>{error}</p>

            <button
              onClick={fetchBills}
              className="ml-4 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            title="Total Bills"
            value={bills.length}
            description="Bills recorded"
            color="blue"
          />

          <SummaryCard
            title="Total Billed"
            value={formatCurrency(totalBilled)}
            description="Excluding cancelled bills"
            color="purple"
          />

          <SummaryCard
            title="Unpaid Bills"
            value={unpaidBills.length}
            description={formatCurrency(pendingAmount) + " outstanding"}
            color="orange"
          />

          <SummaryCard
            title="Paid Bills"
            value={paidBills.length}
            description="Fully paid bills"
            color="green"
          />

        </div>

        {/* Bills Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-semibold text-slate-800">
              Bills Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search and filter billing records.
            </p>

            <div className="mt-5 flex flex-col gap-3 md:flex-row">

              <input
                type="text"
                placeholder="Search by bill ID, patient name or patient ID..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="PAID">Paid</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              Loading billing records...
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-3 text-4xl">🧾</div>

              <h3 className="font-semibold text-slate-700">
                No bills found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">

                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Bill ID</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Bill Date</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredBills.map((bill) => (
                    <tr
                      key={bill.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-semibold text-blue-600">
                        BILL-{String(bill.id).padStart(4, "0")}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">
                          {bill.patientName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Patient ID: {bill.patientId}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {bill.billDate
                          ? new Date(
                              `${bill.billDate}T00:00:00`
                            ).toLocaleDateString("en-IN")
                          : "—"}
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {formatCurrency(bill.totalAmount)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            bill.status
                          )}`}
                        >
                          {(bill.status || "UNKNOWN").replaceAll("_", " ")}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="font-semibold text-blue-600 hover:text-blue-800"
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

          <div className="border-t border-slate-200 px-6 py-4 text-sm text-slate-500">
            Showing {filteredBills.length} of {bills.length} bills
          </div>

        </div>

        {/* Bill Details Modal */}
        {selectedBill && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            onClick={() => setSelectedBill(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="bill-details-title"
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2
                    id="bill-details-title"
                    className="text-2xl font-bold text-slate-800"
                  >
                    Bill Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    BILL-{String(selectedBill.id).padStart(4, "0")}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedBill(null)}
                  aria-label="Close bill details"
                  className="rounded-lg px-3 py-1 text-2xl text-slate-500 hover:bg-slate-100"
                >
                  ×
                </button>
              </div>

              <div className="mb-5 rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Patient Name</p>

                <p className="mt-1 font-semibold text-slate-800">
                  {selectedBill.patientName}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Patient ID: {selectedBill.patientId}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Bill Date: {selectedBill.billDate}
                </p>
              </div>

              <div className="space-y-4">

                <BillAmountRow
                  label="Consultation Fee"
                  amount={selectedBill.consultationFee}
                  formatCurrency={formatCurrency}
                />

                <BillAmountRow
                  label="Medicine Charges"
                  amount={selectedBill.medicineCharges}
                  formatCurrency={formatCurrency}
                />

                <BillAmountRow
                  label="Other Charges"
                  amount={selectedBill.otherCharges}
                  formatCurrency={formatCurrency}
                />

                <div className="border-t border-slate-200 pt-4">
                  <BillAmountRow
                    label="Total Amount"
                    amount={selectedBill.totalAmount}
                    formatCurrency={formatCurrency}
                    bold
                  />
                </div>

              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Payment Status
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                    selectedBill.status
                  )}`}
                >
                  {selectedBill.status.replaceAll("_", " ")}
                </span>
              </div>

              <button
                onClick={() => setSelectedBill(null)}
                className="mt-7 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Close
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function SummaryCard({ title, value, description, color }) {
  const colors = {
    blue: "border-blue-500",
    purple: "border-purple-500",
    orange: "border-orange-500",
    green: "border-green-500",
  };

  return (
    <div
      className={`rounded-xl border border-slate-200 border-l-4 ${colors[color]} bg-white p-5 shadow-sm`}
    >
      <p className="text-sm font-medium text-slate-500">{title}</p>

      <p className="mt-3 break-words text-2xl font-bold text-slate-800">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function BillAmountRow({ label, amount, formatCurrency, bold = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          bold
            ? "font-semibold text-slate-800"
            : "text-sm text-slate-600"
        }
      >
        {label}
      </span>

      <span
        className={
          bold
            ? "text-lg font-bold text-slate-900"
            : "font-medium text-slate-700"
        }
      >
        {formatCurrency(amount)}
      </span>
    </div>
  );
}