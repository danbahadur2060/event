"use client";

import { useState, useEffect } from "react";

type Event = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  mode: string;
  status: "draft" | "published" | "archived";
  createdAt: string;
};

export default function EventManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const res = await fetch("/api/events");
    const data = await res.json();
    if (data.events) setEvents(data.events);
  };

const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This cannot be undone.")) return;

    const res = await fetch(`/api/events/id/${eventId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchEvents();
      alert("Event deleted successfully!");
    } else {
      alert("Failed to delete event");
    }
  };

const handleStatusUpdate = async (eventId: string, newStatus: string) => {
    const res = await fetch(`/api/events/id/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      fetchEvents();
      alert("Event status updated successfully!");
    } else {
      alert("Failed to update event status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-300";
      case "draft":
        return "bg-yellow-500/20 text-yellow-300";
      case "archived":
        return "bg-gray-500/20 text-gray-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  const filteredEvents = filterStatus === "all" 
    ? events 
    : events.filter(e => e.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Management</h2>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-dark-200 rounded px-4 py-2"
          >
            <option value="all">All Events</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <button
            onClick={fetchEvents}
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
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Slug</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Location</th>
                <th className="py-2 pr-4">Mode</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-light-200">
                    No events found
                  </td>
                </tr>
              ) : (
                filteredEvents.map(event => (
                  <tr key={event._id} className="border-t border-dark-200">
                    <td className="py-2 pr-4 font-medium">{event.title}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{event.slug}</td>
                    <td className="py-2 pr-4 text-xs">
                      {event.date} {event.time}
                    </td>
                    <td className="py-2 pr-4 text-xs">{event.location}</td>
                    <td className="py-2 pr-4">{event.mode}</td>
                    <td className="py-2 pr-4">
                      <select
                        value={event.status}
                        onChange={(e) => handleStatusUpdate(event._id, e.target.value)}
                        className={`px-2 py-1 rounded text-xs ${getStatusColor(event.status)}`}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="py-2 pr-4 text-xs">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 pr-4">
                      <a
                        href={`/events/${event.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline mr-2"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredEvents.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dark-200 text-sm">
            <strong>Total Events:</strong> {filteredEvents.length}
          </div>
        )}
      </div>

      <div className="glass p-4 rounded-md">
        <p className="text-light-200">
          💡 <strong>Tip:</strong> Create new events using the "Bookings" tab above, or edit event details through the API.
        </p>
      </div>
    </div>
  );
}
