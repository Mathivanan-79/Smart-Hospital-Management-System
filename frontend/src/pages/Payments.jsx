import { useEffect, useMemo, useState } from "react";
import {
  IndianRupee,
  CreditCard,
  Wallet,
  Search,
  RefreshCw,
  X,
  Receipt,
  CheckCircle,
  Clock,
} from "lucide-react";

import api from "../services/api";

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "UPI", label: "UPI" },
  { value: "ONLINE", label: "Online" },
];

const initialForm = {
  billId: "",
  amount: "",
  paymentDate: new Date().toLocaleDateString("en-CA"),
  paymentMethod: "UPI",
  transactionReference: "",
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [bills, setBills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState(initialForm);

  const [selectedBill, setSelectedBill] = useState(null);
  const [billPayments, setBillPayments] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // LOAD PAYMENTS AND BILLS
  // =====================================================

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [paymentResponse, billResponse] = await Promise.all([
        api.get("/api/payments"),
        api.get("/api/bills"),
      ]);

      setPayments(
        Array.isArray(paymentResponse.data)
          ? paymentResponse.data
          : []
      );

      setBills(
        Array.isArray(billResponse.data)
          ? billResponse.data
          : []
      );
    } catch (err) {
      console.error("Failed to load payment data:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to view all payments or bills."
        );
      } else {
        setError(
          "Unable to load payments. Check your backend connection."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  }

  // =====================================================
  // CALCULATE REMAINING AMOUNT
  // =====================================================

  function getTotalPaid(billId) {
    return payments
      .filter((payment) => Number(payment.billId) === Number(billId))
      .reduce(
        (total, payment) => total + Number(payment.amount || 0),
        0
      );
  }

  function getRemainingAmount(bill) {
    const remaining =
      Number(bill.totalAmount || 0) - getTotalPaid(bill.id);

    return Math.max(0, remaining);
  }

  // =====================================================
  // FILTER PAYMENTS
  // =====================================================

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        String(payment.id ?? "").includes(query) ||
        String(payment.billId ?? "").includes(query) ||
        String(payment.patientId ?? "").includes(query) ||
        (payment.patientName || "").toLowerCase().includes(query) ||
        (payment.transactionReference || "")
          .toLowerCase()
          .includes(query);

      const matchesMethod =
        methodFilter === "ALL" ||
        payment.paymentMethod === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [payments, search, methodFilter]);

  // =====================================================
  // SUMMARY STATISTICS
  // =====================================================

  const totalCollected = payments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  );

  const totalTransactions = payments.length;

  const cashlessTransactions = payments.filter((payment) =>
    ["CARD", "UPI", "ONLINE"].includes(payment.paymentMethod)
  ).length;

  const unpaidBills = bills.filter(
    (bill) => getRemainingAmount(bill) > 0
  ).length;

  // =====================================================
  // HANDLE FORM INPUT
  // =====================================================

  function handleInputChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "billId") {
      const bill = bills.find(
        (item) => Number(item.id) === Number(value)
      );

      setSelectedBill(bill || null);
    }
  }

  // =====================================================
  // OPEN PAYMENT FORM
  // =====================================================

  function openPaymentForm() {
    setError("");
    setSuccess("");

    setForm({
      ...initialForm,
      paymentDate: new Date().toLocaleDateString("en-CA"),
    });

    setSelectedBill(null);
    setShowModal(true);
  }

  // =====================================================
  // CREATE PAYMENT
  // =====================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const bill = bills.find(
      (item) => Number(item.id) === Number(form.billId)
    );

    if (!bill) {
      setError("Please select a valid bill.");
      return;
    }

    const amount = Number(form.amount);
    const remainingAmount = getRemainingAmount(bill);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid payment amount greater than zero.");
      return;
    }

    if (amount > remainingAmount + 0.000001) {
      setError(
        `The payment cannot exceed the remaining balance of ${formatCurrency(
          remainingAmount
        )}.`
      );
      return;
    }

    if (!form.paymentDate) {
      setError("Please select a payment date.");
      return;
    }

    const request = {
      billId: Number(form.billId),
      amount,
      paymentDate: form.paymentDate,
      paymentMethod: form.paymentMethod,
      transactionReference:
        form.transactionReference.trim() || null,
    };

    setSubmitting(true);

    try {
      await api.post("/api/payments", request);

      setSuccess("Payment recorded successfully.");

      setShowModal(false);
      setForm(initialForm);
      setSelectedBill(null);

      await loadData();
    } catch (err) {
      console.error("Payment creation failed:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to record payment. Please check the details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // VIEW BILL PAYMENT HISTORY
  // =====================================================

  async function viewBillPayments(billId) {
    setError("");
    setBillPayments([]);
    setSelectedBill(
      bills.find((bill) => Number(bill.id) === Number(billId)) ||
        null
    );

    try {
      const response = await api.get(
        `/api/payments/bill/${billId}`
      );

      setBillPayments(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Failed to load bill payments:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load payment history for this bill."
      );
    }
  }

  // =====================================================
  // STATUS BADGE
  // =====================================================

  function getMethodStyle(method) {
    switch (method) {
      case "CASH":
        return "bg-green-100 text-green-700";

      case "CARD":
        return "bg-blue-100 text-blue-700";

      case "UPI":
        return "bg-violet-100 text-violet-700";

      case "ONLINE":
        return "bg-amber-100 text-amber-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Payment Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Record transactions and monitor patient payments.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openPaymentForm}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              + Record Payment
            </button>
          </div>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        {/* SUMMARY CARDS */}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            title="Total Transactions"
            value={totalTransactions}
            description="Recorded payments"
            icon={<Receipt size={22} />}
            color="blue"
          />

          <SummaryCard
            title="Total Collected"
            value={formatCurrency(totalCollected)}
            description="Across all transactions"
            icon={<IndianRupee size={22} />}
            color="green"
          />

          <SummaryCard
            title="Cashless Transactions"
            value={cashlessTransactions}
            description="Card, UPI and online"
            icon={<CreditCard size={22} />}
            color="purple"
          />

          <SummaryCard
            title="Bills With Balance"
            value={unpaidBills}
            description="Bills with outstanding amounts"
            icon={<Clock size={22} />}
            color="orange"
          />

        </div>

        {/* PAYMENTS TABLE */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-bold text-slate-800">
              Payment History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search and review recorded transactions.
            </p>

            <div className="mt-5 flex flex-col gap-3 md:flex-row">

              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search payment, bill, patient or reference..."
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <select
                value={methodFilter}
                onChange={(event) => setMethodFilter(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="ALL">All Methods</option>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>

            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              Loading payment history...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet
                size={40}
                className="mx-auto mb-3 text-slate-300"
              />

              <h3 className="font-semibold text-slate-700">
                No payments found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Record a payment or change your search filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">

                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Payment ID</th>
                    <th className="px-6 py-4">Bill ID</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-semibold text-blue-700">
                        PAY-{String(payment.id).padStart(4, "0")}
                      </td>

                      <td className="px-6 py-4">
                        BILL-{String(payment.billId).padStart(4, "0")}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">
                          {payment.patientName || "Unknown patient"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Patient ID: {payment.patientId ?? "—"}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {payment.paymentDate
                          ? new Date(
                              `${payment.paymentDate}T00:00:00`
                            ).toLocaleDateString("en-IN")
                          : "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getMethodStyle(
                            payment.paymentMethod
                          )}`}
                        >
                          {payment.paymentMethod}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {formatCurrency(payment.amount)}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => viewBillPayments(payment.billId)}
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Bill History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-slate-200 px-6 py-4 text-sm text-slate-500">
            Showing {filteredPayments.length} of {payments.length} payments
          </div>
        </div>

        {/* RECORD PAYMENT MODAL */}

        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4"
            onClick={() => !submitting && setShowModal(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="record-payment-title"
              className="my-8 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2
                    id="record-payment-title"
                    className="text-2xl font-bold text-slate-900"
                  >
                    Record Payment
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Record a payment against an existing bill.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                  aria-label="Close payment form"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* SELECT BILL */}

                <div>
                  <label
                    htmlFor="billId"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Select Bill *
                  </label>

                  <select
                    id="billId"
                    name="billId"
                    required
                    value={form.billId}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Choose a bill</option>

                    {bills
                      .filter((bill) => getRemainingAmount(bill) > 0.001)
                      .map((bill) => (
                        <option key={bill.id} value={bill.id}>
                          BILL-{String(bill.id).padStart(4, "0")} —{" "}
                          {bill.patientName} — Balance:{" "}
                          {formatCurrency(getRemainingAmount(bill))}
                        </option>
                      ))}
                  </select>

                  {bills.filter(
                    (bill) => getRemainingAmount(bill) > 0.001
                  ).length === 0 && (
                    <p className="mt-2 text-sm text-amber-700">
                      There are no bills with an outstanding balance.
                    </p>
                  )}
                </div>

                {/* BILL SUMMARY */}

                {selectedBill && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p className="font-semibold text-slate-800">
                      {selectedBill.patientName}
                    </p>

                    <div className="mt-3 flex justify-between gap-3 text-sm">
                      <span className="text-slate-600">
                        Original Bill Amount
                      </span>

                      <span className="font-semibold text-slate-800">
                        {formatCurrency(selectedBill.totalAmount)}
                      </span>
                    </div>

                    <div className="mt-2 flex justify-between gap-3 text-sm">
                      <span className="text-slate-600">
                        Previously Paid
                      </span>

                      <span className="font-semibold text-slate-800">
                        {formatCurrency(getTotalPaid(selectedBill.id))}
                      </span>
                    </div>

                    <div className="mt-2 flex justify-between gap-3 text-sm">
                      <span className="font-semibold text-blue-800">
                        Remaining Balance
                      </span>

                      <span className="font-bold text-blue-800">
                        {formatCurrency(getRemainingAmount(selectedBill))}
                      </span>
                    </div>
                  </div>
                )}

                {/* PAYMENT AMOUNT */}

                <div>
                  <label
                    htmlFor="amount"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Payment Amount (₹) *
                  </label>

                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={
                      selectedBill
                        ? getRemainingAmount(selectedBill)
                        : undefined
                    }
                    required
                    value={form.amount}
                    onChange={handleInputChange}
                    placeholder="Enter payment amount"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  {selectedBill && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          amount: getRemainingAmount(selectedBill).toFixed(2),
                        }))
                      }
                      className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Pay full remaining balance
                    </button>
                  )}
                </div>

                {/* PAYMENT DATE */}

                <div>
                  <label
                    htmlFor="paymentDate"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Payment Date *
                  </label>

                  <input
                    id="paymentDate"
                    name="paymentDate"
                    type="date"
                    required
                    value={form.paymentDate}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* PAYMENT METHOD */}

                <div>
                  <label
                    htmlFor="paymentMethod"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Payment Method *
                  </label>

                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    required
                    value={form.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TRANSACTION REFERENCE */}

                <div>
                  <label
                    htmlFor="transactionReference"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Transaction Reference
                  </label>

                  <input
                    id="transactionReference"
                    name="transactionReference"
                    type="text"
                    maxLength={100}
                    value={form.transactionReference}
                    onChange={handleInputChange}
                    placeholder="Optional transaction ID or reference"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* ACTIONS */}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      bills.filter(
                        (bill) => getRemainingAmount(bill) > 0.001
                      ).length === 0
                    }
                    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Recording..." : "Record Payment"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* BILL PAYMENT HISTORY MODAL */}

        {selectedBill && !showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4"
            onClick={() => {
              setSelectedBill(null);
              setBillPayments([]);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="payment-history-title"
              className="my-8 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2
                    id="payment-history-title"
                    className="text-xl font-bold text-slate-900"
                  >
                    Bill Payment History
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    BILL-{String(selectedBill.id).padStart(4, "0")} —{" "}
                    {selectedBill.patientName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedBill(null);
                    setBillPayments([]);
                  }}
                  aria-label="Close payment history"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-5 rounded-xl bg-slate-50 p-4">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-500">Bill Amount</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedBill.totalAmount)}
                  </span>
                </div>

                <div className="mt-2 flex justify-between gap-3 text-sm">
                  <span className="text-slate-500">Paid</span>
                  <span className="font-semibold text-green-700">
                    {formatCurrency(getTotalPaid(selectedBill.id))}
                  </span>
                </div>

                <div className="mt-2 flex justify-between gap-3 text-sm">
                  <span className="text-slate-500">Remaining</span>
                  <span className="font-semibold text-orange-700">
                    {formatCurrency(getRemainingAmount(selectedBill))}
                  </span>
                </div>
              </div>

              {billPayments.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  No payment records found for this bill.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-3">Payment</th>
                        <th className="px-3 py-3">Date</th>
                        <th className="px-3 py-3">Method</th>
                        <th className="px-3 py-3 text-right">Amount</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {billPayments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-3 py-3">
                            PAY-{String(payment.id).padStart(4, "0")}
                          </td>

                          <td className="px-3 py-3">
                            {payment.paymentDate || "—"}
                          </td>

                          <td className="px-3 py-3">
                            {payment.paymentMethod}
                          </td>

                          <td className="px-3 py-3 text-right font-semibold">
                            {formatCurrency(payment.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setSelectedBill(null);
                  setBillPayments([]);
                }}
                className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
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

// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({ title, value, description, icon, color }) {
  const colors = {
    blue: "border-blue-500 bg-blue-50 text-blue-700",
    green: "border-green-500 bg-green-50 text-green-700",
    purple: "border-purple-500 bg-purple-50 text-purple-700",
    orange: "border-orange-500 bg-orange-50 text-orange-700",
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200 border-l-4 bg-white p-5 shadow-sm ${colors[color]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-3 break-words text-2xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-white p-3 shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}