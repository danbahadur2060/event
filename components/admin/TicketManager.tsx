"use client";

import { useState, useEffect } from "react";

type TicketType = {
  _id: string;
  eventId: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  quantity: number;
  salesStart?: string | null;
  salesEnd?: string | null;
  perUserLimit?: number | null;
};

type Event = {
  _id: string;
  title: string;
  slug: string;
};

export default function TicketManager() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    eventId: "",
    name: "",
    category: "general",
    price: "",
    currency: "USD",
    quantity: "",
    salesStart: "",
    salesEnd: "",
    perUserLimit: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const res = await fetch("/api/events");
    const data = await res.json();
    if (data.events) setEvents(data.events);
  };

  const fetchTickets = async (eventId: string) => {
    const res = await fetch(`/api/tickets?eventId=${eventId}`);
    const data = await res.json();
    if (data.tickets) setTickets(data.tickets);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
        quantity: parseInt(formData.quantity),
        perUserLimit: formData.perUserLimit ? parseInt(formData.perUserLimit) : null,
        salesStart: formData.salesStart || null,
        salesEnd: formData.salesEnd || null,
      }),
    });

    if (res.ok) {
      setShowCreateForm(false);
      resetForm();
      if (formData.eventId) fetchTickets(formData.eventId);
      alert("Ticket created successfully!");
    } else {
      const data = await res.json();
      alert(data.message || "Failed to create ticket");
    }
  };

  const handleUpdate = async (ticketId: string) => {
    const ticket = tickets.find(t => t._id === ticketId);
    if (!ticket) return;

    const res = await fetch("/api/tickets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticketId,
        ...formData,
        price: Math.round(parseFloat(formData.price) * 100),
        quantity: parseInt(formData.quantity),
        perUserLimit: formData.perUserLimit ? parseInt(formData.perUserLimit) : null,
        salesStart: formData.salesStart || null,
        salesEnd: formData.salesEnd || null,
      }),
    });

    if (res.ok) {
      setEditingId(null);
      resetForm();
      if (ticket.eventId) fetchTickets(ticket.eventId);
      alert("Ticket updated successfully!");
    } else {
      const data = await res.json();
      alert(data.message || "Failed to update ticket");
    }
  };

  const handleDelete = async (ticketId: string, eventId: string) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    const res = await fetch(`/api/tickets?ticketId=${ticketId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchTickets(eventId);
      alert("Ticket deleted successfully!");
    } else {
      alert("Failed to delete ticket");
    }
  };

  const startEdit = (ticket: TicketType) => {
    setEditingId(ticket._id);
    setFormData({
      eventId: ticket.eventId,
      name: ticket.name,
      category: ticket.category,
      price: (ticket.price / 100).toString(),
      currency: ticket.currency,
      quantity: ticket.quantity.toString(),
      salesStart: ticket.salesStart || "",
      salesEnd: ticket.salesEnd || "",
      perUserLimit: ticket.perUserLimit?.toString() || "",
    });
  };

  const resetForm = () => {
    setFormData({
      eventId: "",
      name: "",
      category: "general",
      price: "",
      currency: "USD",
      quantity: "",
      salesStart: "",
      salesEnd: "",
      perUserLimit: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ticket Management</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-primary text-black px-4 py-2 rounded"
        >
          {showCreateForm ? "Cancel" : "Create Ticket"}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="glass p-6 rounded-md space-y-4">
          <h3 className="text-xl font-bold">Create New Ticket</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={formData.eventId}
              onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
              required
              className="bg-dark-200 rounded px-4 py-2"
            >
              <option value="">Select Event</option>
              {events.map(e => (
                <option key={e._id} value={e._id}>{e.title}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Ticket Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-dark-200 rounded px-4 py-2"
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="bg-dark-200 rounded px-4 py-2"
            >
              <option value="general">General</option>
              <option value="vip">VIP</option>
              <option value="student">Student</option>
              <option value="group">Group</option>
              <option value="comp">Complimentary</option>
              <option value="donation">Donation</option>
              <option value="sponsor">Sponsor</option>
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Price (USD)"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              className="bg-dark-200 rounded px-4 py-2"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
              className="bg-dark-200 rounded px-4 py-2"
            />
            <input
              type="number"
              placeholder="Per User Limit (optional)"
              value={formData.perUserLimit}
              onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
              className="bg-dark-200 rounded px-4 py-2"
            />
            <input
              type="datetime-local"
              placeholder="Sales Start"
              value={formData.salesStart}
              onChange={(e) => setFormData({ ...formData, salesStart: e.target.value })}
              className="bg-dark-200 rounded px-4 py-2"
            />
            <input
              type="datetime-local"
              placeholder="Sales End"
              value={formData.salesEnd}
              onChange={(e) => setFormData({ ...formData, salesEnd: e.target.value })}
              className="bg-dark-200 rounded px-4 py-2"
            />
          </div>
          <button type="submit" className="bg-primary text-black px-6 py-2 rounded">
            Create Ticket
          </button>
        </form>
      )}

      <div className="glass p-6 rounded-md space-y-4">
        <div>
          <label className="block mb-2">Select Event to View Tickets:</label>
          <select
            onChange={(e) => e.target.value && fetchTickets(e.target.value)}
            className="bg-dark-200 rounded px-4 py-2 w-full max-w-md"
          >
            <option value="">Choose an event...</option>
            {events.map(e => (
              <option key={e._id} value={e._id}>{e.title}</option>
            ))}
          </select>
        </div>

        {tickets.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-light-200">
                <tr>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4">Quantity</th>
                  <th className="py-2 pr-4">Sales Period</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket._id} className="border-t border-dark-200">
                    {editingId === ticket._id ? (
                      <>
                        <td className="py-2 pr-4">
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-dark-200 rounded px-2 py-1 w-full"
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="bg-dark-200 rounded px-2 py-1"
                          >
                            <option value="general">General</option>
                            <option value="vip">VIP</option>
                            <option value="student">Student</option>
                            <option value="group">Group</option>
                          </select>
                        </td>
                        <td className="py-2 pr-4">
                          <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="bg-dark-200 rounded px-2 py-1 w-24"
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            className="bg-dark-200 rounded px-2 py-1 w-20"
                          />
                        </td>
                        <td className="py-2 pr-4">-</td>
                        <td className="py-2 pr-4">
                          <button
                            onClick={() => handleUpdate(ticket._id)}
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
                        <td className="py-2 pr-4">{ticket.name}</td>
                        <td className="py-2 pr-4">{ticket.category}</td>
                        <td className="py-2 pr-4">${(ticket.price / 100).toFixed(2)}</td>
                        <td className="py-2 pr-4">{ticket.quantity}</td>
                        <td className="py-2 pr-4 text-xs">
                          {ticket.salesStart ? new Date(ticket.salesStart).toLocaleDateString() : "Now"} - {ticket.salesEnd ? new Date(ticket.salesEnd).toLocaleDateString() : "∞"}
                        </td>
                        <td className="py-2 pr-4">
                          <button
                            onClick={() => startEdit(ticket)}
                            className="text-blue-400 hover:underline mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(ticket._id, ticket.eventId)}
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
        )}
      </div>
    </div>
  );
}
