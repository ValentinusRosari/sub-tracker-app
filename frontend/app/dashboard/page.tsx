"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { LogOut, Plus, CreditCard, Calendar, Activity, X, Trash2, Pencil } from "lucide-react";

interface Subscription {
  id: string;
  name: string;
  price: string;
  billingCycle: string;
  nextBillingDate: string;
  category: string;
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // State Data
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [summary, setSummary] = useState({ totalMonthly: 0, count: 0 });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");

  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    billingCycle: "monthly",
    startDate: new Date().toISOString().split("T")[0],
    category: "Entertainment",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fungsi untuk mengambil data
  const fetchData = useCallback(async () => {
    try {
      const [subsResponse, summaryResponse] = await Promise.all([
        api.get("/subs"),
        api.get("/subs/summary"),
      ]);
      setSubs(subsResponse.data);
      setSummary(summaryResponse.data);
    } catch (err: any) {
      setError("Failed to fetch dashboard data. Please try again.");
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Efek inisialisasi awal
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [user, loading, router, fetchData]);

  // Fungsi Submit Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        // Jika sedang mode edit, panggil API PUT
        await api.put(`/subs/${editingId}`, formData);
      } else {
        // Jika mode tambah baru, panggil API POST
        await api.post("/subs", formData);
      }

      // Reset dan tutup modal
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        name: "",
        price: "",
        billingCycle: "monthly",
        startDate: new Date().toISOString().split("T")[0],
        category: "Entertainment",
      });
      fetchData(); // Refresh data
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi Hapus Subscription
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this subscription?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/subs/${id}`);
      fetchData();
    } catch (err: any) {
      alert("Failed to delete subscription.");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Fungsi untuk mengambil data yang di-klik
  const handleEditClick = (sub: Subscription) => {
    setFormData({
      name: sub.name,
      price: sub.price,
      billingCycle: sub.billingCycle,
      startDate: sub.nextBillingDate.split("T")[0],
      category: sub.category,
    });
    setEditingId(sub.id);
    setIsModalOpen(true);
  };

  if (loading || (!user && !loading)) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <Activity className="h-6 w-6" /> SubTracker
          </h1>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 relative">
        {/* Judul & Tombol Add */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold">My Dashboard</h2>
            <p className="text-gray-500 mt-1">Track and manage your recurring expenses.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add New
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Monthly Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(parseFloat(summary.totalMonthly.toString()))}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">{summary.count} Services</p>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 text-sm">{error}</div>}

        {/* Subscription List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Your Subscriptions</h3>
          </div>

          {isLoadingData ? (
            <div className="p-8 text-center text-gray-500">Loading your data...</div>
          ) : subs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No subscriptions found. Click "Add New" to get started.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {subs.map((sub) => (
                <div
                  key={sub.id}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                      {sub.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{sub.name}</h4>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full mt-1 inline-block">
                        {sub.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1">
                    <p className="font-bold text-gray-900">
                      {formatCurrency(parseFloat(sub.price))}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Next billing:{" "}
                      {new Date(sub.nextBillingDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <button
                      onClick={() => handleEditClick(sub)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit Subscription"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Subscription"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* NEW SUBSCRIPTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {editingId ? "Edit Subscription" : "Add New Subscription"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Netflix, Spotify"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (IDR)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="150000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Cycle
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Entertainment">Entertainment</option>
                    <option value="Software">Software/Dev</option>
                    <option value="Utility">Utility</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingId ? "Update Service" : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
