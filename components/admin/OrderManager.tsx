"use client";

import { useState, useEffect } from "react";

type Order = {
  _id: string;
  eventId: any;
  email: string;
  items: Array<{
    ticketTypeId: string;
    quantity: number;
    unitAmount: number;
  }>;
  currency: string;
  totalAmount: number;
  status: "pending" | "paid" | "failed" | "refunded" | "partial_refunded";
  stripeSessionId?: string;
  invoiceUrl?: string;
  createdAt: string;
};

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch("/api/orders");
    const data = await res.json();
    if (data.orders) setOrders(data.orders);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!confirm(`Change order status to "${newStatus}"?`)) return;

    const res = await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: newStatus }),
    });

    if (res.ok) {
      fetchOrders();
      alert("Order status updated successfully!");
    } else {
      const data = await res.json();
      alert(data.message || "Failed to update order");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-300";
      case "pending":
        return "bg-yellow-500/20 text-yellow-300";
      case "failed":
        return "bg-red-500/20 text-red-300";
      case "refunded":
      case "partial_refunded":
        return "bg-blue-500/20 text-blue-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-dark-200 rounded px-4 py-2"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="partial_refunded">Partial Refunded</option>
          </select>
          <button
            onClick={fetchOrders}
            className="bg-primary text-black px-4 py-2 rounded"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="glass p-6 rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-light-200">
              <tr>
                <th className="py-2 pr-4">Order ID</th>
                <th className="py-2 pr-4">Event</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Items</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-light-200">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order._id} className="border-t border-dark-200">
                    <td className="py-2 pr-4 font-mono text-xs">
                      {order._id.slice(-8)}
                    </td>
                    <td className="py-2 pr-4">
                      {order.eventId?.title || "N/A"}
                    </td>
                    <td className="py-2 pr-4">{order.email}</td>
                    <td className="py-2 pr-4">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} tickets
                    </td>
                    <td className="py-2 pr-4">
                      ${(order.totalAmount / 100).toFixed(2)} {order.currency}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className="bg-dark-200 rounded px-2 py-1 text-xs"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                        <option value="partial_refunded">Partial Refunded</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredOrders.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dark-200 flex justify-between text-sm">
            <div>
              <strong>Total Orders:</strong> {filteredOrders.length}
            </div>
            <div>
              <strong>Total Revenue:</strong> $
              {(filteredOrders
                .filter(o => o.status === "paid")
                .reduce((sum, o) => sum + o.totalAmount, 0) / 100
              ).toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
