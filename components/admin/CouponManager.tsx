"use client";

import { useState, useEffect } from "react";

type Coupon = {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  amount: number;
  expiresAt?: string | null;
  maxUses?: number | null;
  usedCount: number;
  targetEmails?: string[];
  createdAt: string;
};

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "percent" as "percent" | "fixed",
    amount: "",
    expiresAt: "",
    maxUses: "",
    targetEmails: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const res = await fetch("/api/coupons");
    const data = await res.json();
    if (data.coupons) setCoupons(data.coupons);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      code: formData.code.toUpperCase(),
      type: formData.type,
      amount: formData.type === "fixed" 
        ? Math.round(parseFloat(formData.amount) * 100) 
        : parseFloat(formData.amount),
      expiresAt: formData.expiresAt || null,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      targetEmails: formData.targetEmails 
        ? formData.targetEmails.split(",").map(e => e.trim()).filter(Boolean) 
        : [],
    };

    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setShowCreateForm(false);
      resetForm();
      fetchCoupons();
      alert("Coupon created successfully!");
    } else {
      const data = await res.json();
      alert(data.message || "Failed to create coupon");
    }
  };

  const handleUpdate = async (couponId: string) => {
    const payload: any = {
      couponId,
      code: formData.code.toUpperCase(),
      type: formData.type,
      amount: formData.type === "fixed" 
        ? Math.round(parseFloat(formData.amount) * 100) 
        : parseFloat(formData.amount),
      expiresAt: formData.expiresAt || null,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      targetEmails: formData.targetEmails 
        ? formData.targetEmails.split(",").map(e => e.trim()).filter(Boolean) 
        : [],
    };

    const res = await fetch("/api/coupons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setEditingId(null);
      resetForm();
      fetchCoupons();
      alert("Coupon updated successfully!");
    } else {
      const data = await res.json();
      alert(data.message || "Failed to update coupon");
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    const res = await fetch(`/api/coupons?couponId=${couponId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchCoupons();
      alert("Coupon deleted successfully!");
    } else {
      alert("Failed to delete coupon");
    }
  };

  const startEdit = (coupon: Coupon) => {
    setEditingId(coupon._id);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      amount: coupon.type === "fixed" 
        ? (coupon.amount / 100).toString() 
        : coupon.amount.toString(),
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : "",
      maxUses: coupon.maxUses?.toString() || "",
      targetEmails: coupon.targetEmails?.join(", ") || "",
    });
  };

  const resetForm = () => {
    setFormData({
      code: "",
      type: "percent",
      amount: "",
      expiresAt: "",
      maxUses: "",
      targetEmails: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Coupon Management</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-primary text-black px-4 py-2 rounded"
        >
          {showCreateForm ? "Cancel" : "Create Coupon"}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="glass p-6 rounded-md space-y-4">
          <h3 className="text-xl font-bold">Create New Coupon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Coupon Code (e.g., SAVE20)"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              className="bg-dark-200 rounded px-4 py-2"
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as "percent" | "fixed" })}
              className="bg-dark-200 rounded px-4 py-2"
            >
              <option value="percent">Percent Off (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
            <input
              type="number"
              step="0.01"
              placeholder={formData.type === "percent" ? "Amount (0-100)" : "Amount in USD"}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              className="bg-dark-200 rounded px-4 py-2"
            />
            <input
              type="number"
              placeholder="Max Uses (optional)"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              className="bg-dark-200 rounded px-4 py-2"
            />
            <input
              type="datetime-local"
              placeholder="Expires At"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className="bg-dark-200 rounded px-4 py-2"
            />
            <input
              type="text"
              placeholder="Target Emails (comma-separated, optional)"
              value={formData.targetEmails}
              onChange={(e) => setFormData({ ...formData, targetEmails: e.target.value })}
              className="bg-dark-200 rounded px-4 py-2 md:col-span-2"
            />
          </div>
          <button type="submit" className="bg-primary text-black px-6 py-2 rounded">
            Create Coupon
          </button>
        </form>
      )}

      <div className="glass p-6 rounded-md">
        <h3 className="text-xl font-bold mb-4">All Coupons</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-light-200">
              <tr>
                <th className="py-2 pr-4">Code</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Used / Max</th>
                <th className="py-2 pr-4">Expires</th>
                <th className="py-2 pr-4">Target Emails</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon._id} className="border-t border-dark-200">
                  {editingId === coupon._id ? (
                    <>
                      <td className="py-2 pr-4">
                        <input
                          type="text"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                          className="bg-dark-200 rounded px-2 py-1 w-full font-mono"
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as "percent" | "fixed" })}
                          className="bg-dark-200 rounded px-2 py-1"
                        >
                          <option value="percent">%</option>
                          <option value="fixed">$</option>
                        </select>
                      </td>
                      <td className="py-2 pr-4">
                        <input
                          type="number"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="bg-dark-200 rounded px-2 py-1 w-24"
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <input
                          type="number"
                          value={formData.maxUses}
                          onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                          placeholder="∞"
                          className="bg-dark-200 rounded px-2 py-1 w-20"
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <input
                          type="datetime-local"
                          value={formData.expiresAt}
                          onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                          className="bg-dark-200 rounded px-2 py-1"
                        />
                      </td>
                      <td className="py-2 pr-4">-</td>
                      <td className="py-2 pr-4">
                        <button
                          onClick={() => handleUpdate(coupon._id)}
                          className="text-green-400 hover:underline mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            resetForm();
                          }}
                          className="text-gray-400 hover:underline"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 pr-4 font-mono font-bold">{coupon.code}</td>
                      <td className="py-2 pr-4">{coupon.type}</td>
                      <td className="py-2 pr-4">
                        {coupon.type === "percent" 
                          ? `${coupon.amount}%` 
                          : `$${(coupon.amount / 100).toFixed(2)}`}
                      </td>
                      <td className="py-2 pr-4">
                        {coupon.usedCount} / {coupon.maxUses || "∞"}
                      </td>
                      <td className="py-2 pr-4 text-xs">
                        {coupon.expiresAt 
                          ? new Date(coupon.expiresAt).toLocaleDateString() 
                          : "Never"}
                      </td>
                      <td className="py-2 pr-4 text-xs">
                        {coupon.targetEmails && coupon.targetEmails.length > 0 
                          ? `${coupon.targetEmails.length} emails` 
                          : "All"}
                      </td>
                      <td className="py-2 pr-4">
                        <button
                          onClick={() => startEdit(coupon)}
                          className="text-blue-400 hover:underline mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
