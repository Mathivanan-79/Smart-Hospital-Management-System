import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const emptyForm = {
  name: "",
  manufacturer: "",
  description: "",
  price: "",
  stockQuantity: "",
  active: true,
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const LOW_STOCK_LIMIT = 10;

  const loadMedicines = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/medicines");
      setMedicines(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load medicines. Please check the backend and your login."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const stats = useMemo(() => {
    const activeMedicines = medicines.filter((medicine) => medicine.active);
    const lowStock = activeMedicines.filter(
      (medicine) =>
        Number(medicine.stockQuantity) <= LOW_STOCK_LIMIT
    );
    const outOfStock = activeMedicines.filter(
      (medicine) => Number(medicine.stockQuantity) === 0
    );

    return {
      total: medicines.length,
      active: activeMedicines.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
    };
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    const query = search.trim().toLowerCase();

    return medicines.filter((medicine) => {
      const matchesSearch =
        !query ||
        medicine.name?.toLowerCase().includes(query) ||
        medicine.manufacturer?.toLowerCase().includes(query) ||
        medicine.description?.toLowerCase().includes(query);

      const quantity = Number(medicine.stockQuantity) || 0;

      const matchesStock =
        stockFilter === "ALL" ||
        (stockFilter === "LOW" &&
          quantity > 0 &&
          quantity <= LOW_STOCK_LIMIT &&
          medicine.active) ||
        (stockFilter === "OUT" &&
          quantity === 0 &&
          medicine.active) ||
        (stockFilter === "INACTIVE" && !medicine.active);

      return matchesSearch && matchesStock;
    });
  }, [medicines, search, stockFilter]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (medicine) => {
    setEditingId(medicine.id);
    setForm({
      name: medicine.name ?? "",
      manufacturer: medicine.manufacturer ?? "",
      description: medicine.description ?? "",
      price: String(medicine.price ?? ""),
      stockQuantity: String(medicine.stockQuantity ?? 0),
      active: Boolean(medicine.active),
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const price = Number(form.price);
    const stockQuantity = Number(form.stockQuantity);

    if (!form.name.trim() || !form.manufacturer.trim()) {
      setError("Medicine name and manufacturer are required.");
      return;
    }

    if (form.price.trim() === "" || !Number.isFinite(price) || price < 0) {
      setError("Enter a valid, non-negative price.");
      return;
    }

    if (
      form.stockQuantity.trim() === "" ||
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      setError("Stock quantity must be a non-negative whole number.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      manufacturer: form.manufacturer.trim(),
      description: form.description.trim(),
      price,
      stockQuantity,
      active: form.active,
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await api.put(`/api/medicines/${editingId}`, payload);
        setSuccess("Medicine updated successfully.");
      } else {
        await api.post("/api/medicines", payload);
        setSuccess("Medicine added successfully.");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadMedicines();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save medicine. Please check the form and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Hospital Management / Inventory
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Medicines
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage medicine details, pricing, and stock levels.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            + Add Medicine
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="font-bold"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <span>{success}</span>
            <button
              onClick={() => setSuccess("")}
              className="font-bold"
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Medicines" value={stats.total} />
          <StatCard label="Active Medicines" value={stats.active} />
          <StatCard
            label="Low Stock"
            value={stats.lowStock}
            warning={stats.lowStock > 0}
          />
          <StatCard
            label="Out of Stock"
            value={stats.outOfStock}
            warning={stats.outOfStock > 0}
          />
        </div>

        {/* Inventory table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold">Medicine Inventory</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredMedicines.length} medicine
                {filteredMedicines.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search medicines..."
                className="min-w-0 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 sm:w-64"
              />

              <select
                value={stockFilter}
                onChange={(event) => setStockFilter(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
              >
                <option value="ALL">All medicines</option>
                <option value="LOW">Low stock</option>
                <option value="OUT">Out of stock</option>
                <option value="INACTIVE">Inactive medicines</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Loading medicines...
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-semibold text-slate-700">
                No medicines found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try another search or add a new medicine.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Medicine</th>
                    <th className="px-5 py-4">Manufacturer</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredMedicines.map((medicine) => {
                    const quantity = Number(medicine.stockQuantity) || 0;
                    const lowStock =
                      medicine.active &&
                      quantity > 0 &&
                      quantity <= LOW_STOCK_LIMIT;
                    const outOfStock =
                      medicine.active && quantity === 0;

                    return (
                      <tr key={medicine.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {medicine.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            ID: {medicine.id}
                          </p>
                          {medicine.description && (
                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                              {medicine.description}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {medicine.manufacturer}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {formatCurrency(medicine.price)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`font-semibold ${
                              outOfStock
                                ? "text-red-600"
                                : lowStock
                                  ? "text-amber-600"
                                  : "text-slate-700"
                            }`}
                          >
                            {quantity}
                          </span>
                          {outOfStock && (
                            <p className="mt-1 text-xs text-red-600">
                              Out of stock
                            </p>
                          )}
                          {lowStock && (
                            <p className="mt-1 text-xs text-amber-600">
                              Low stock
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge active={medicine.active} />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => openEditForm(medicine)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-xs text-slate-500">
          Low stock is defined here as 10 or fewer units. This threshold is
          currently configured in the frontend.
        </p>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId !== null ? "Edit Medicine" : "Add Medicine"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the medicine information below.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100"
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Medicine Name *">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    maxLength={150}
                    className="form-input"
                    placeholder="e.g. Paracetamol 500mg"
                  />
                </FormField>

                <FormField label="Manufacturer *">
                  <input
                    name="manufacturer"
                    value={form.manufacturer}
                    onChange={handleChange}
                    required
                    maxLength={150}
                    className="form-input"
                    placeholder="e.g. ABC Pharmaceuticals"
                  />
                </FormField>

                <FormField label="Price (₹) *">
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                  />
                </FormField>

                <FormField label="Stock Quantity *">
                  <input
                    name="stockQuantity"
                    type="number"
                    value={form.stockQuantity}
                    onChange={handleChange}
                    required
                    min="0"
                    step="1"
                    className="form-input"
                    placeholder="0"
                  />
                </FormField>
              </div>

              <FormField label="Description">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  maxLength={1000}
                  className="form-input resize-y"
                  placeholder="Enter medicine details..."
                />
              </FormField>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  className="h-4 w-4 accent-slate-900"
                />
                <span>
                  <span className="block text-sm font-semibold">
                    Active medicine
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Inactive medicines remain in the inventory but are marked
                    unavailable.
                  </span>
                </span>
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Update Medicine"
                      : "Save Medicine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, warning = false }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p
        className={`mt-3 text-3xl font-bold ${
          warning ? "text-amber-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}