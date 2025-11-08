"use client";

import { useEffect, useMemo, useState } from "react";

type EventItem = {
  _id?: string;
  title: string;
  slug?: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
};

const emptyEvent: EventItem = {
  title: "",
  description: "",
  overview: "",
  image: "",
  venue: "",
  location: "",
  date: "",
  time: "",
  mode: "",
  audience: "",
  agenda: [],
  organizer: "",
  tags: [],
};

const DashboardPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [createForm, setCreateForm] = useState<EventItem>({ ...emptyEvent });
  const [createFile, setCreateFile] = useState<File | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EventItem>({ ...emptyEvent });
  const [editFile, setEditFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    try {
      setIsAdmin(localStorage.getItem("isAdmin") === "true");
    } catch {}
  }, []);

  const formattedEvents = useMemo(() => events, [events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch events");
      setEvents(data.events ?? []);
    } catch (e: any) {
      setError(e.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      if (!createFile) throw new Error("Image is required");
      const fd = new FormData();
      fd.append("title", createForm.title);
      fd.append("description", createForm.description);
      fd.append("overview", createForm.overview);
      fd.append("venue", createForm.venue);
      fd.append("location", createForm.location);
      fd.append("date", createForm.date);
      fd.append("time", createForm.time);
      fd.append("mode", createForm.mode);
      fd.append("audience", createForm.audience);
      fd.append("organizer", createForm.organizer);
      fd.append("tags", JSON.stringify(createForm.tags));
      fd.append("agenda", JSON.stringify(createForm.agenda));
      fd.append("image", createFile);

      const res = await fetch("/api/events", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Create failed");
      setMessage("Event created");
      setCreateForm({ ...emptyEvent });
      setCreateFile(null);
      await fetchEvents();
    } catch (e: any) {
      setError(e.message || "Create failed");
    }
  };

  const startEdit = (ev: EventItem) => {
    setEditingSlug(ev.slug || "");
    setEditForm({
      title: ev.title,
      description: ev.description,
      overview: ev.overview,
      image: ev.image,
      venue: ev.venue,
      location: ev.location,
      date: ev.date?.slice(0, 10) || "",
      time: ev.time || "",
      mode: ev.mode,
      audience: ev.audience,
      agenda: ev.agenda || [],
      organizer: ev.organizer,
      tags: ev.tags || [],
    });
    setEditFile(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlug) return;
    setError("");
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("title", editForm.title);
      fd.append("description", editForm.description);
      fd.append("overview", editForm.overview);
      fd.append("venue", editForm.venue);
      fd.append("location", editForm.location);
      fd.append("date", editForm.date);
      fd.append("time", editForm.time);
      fd.append("mode", editForm.mode);
      fd.append("audience", editForm.audience);
      fd.append("organizer", editForm.organizer);
      fd.append("tags", JSON.stringify(editForm.tags));
      fd.append("agenda", JSON.stringify(editForm.agenda));
      if (editFile) fd.append("image", editFile);

      const res = await fetch(`/api/events/${encodeURIComponent(editingSlug)}`, {
        method: "PUT",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || data?.message || "Update failed");
      setMessage("Event updated");
      setEditingSlug(null);
      await fetchEvents();
    } catch (e: any) {
      setError(e.message || "Update failed");
    }
  };

  const handleDelete = async (slug: string | undefined) => {
    if (!slug) return;
    if (!confirm("Delete this event?")) return;
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error?.message || data?.message || "Delete failed");
      setMessage("Event deleted");
      await fetchEvents();
    } catch (e: any) {
      setError(e.message || "Delete failed");
    }
  };

  if (!isAdmin) {
    return (
      <section className="mt-20 px-4 sm:px-9">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-2">You must be an admin to access this page.</p>
      </section>
    );
  }

  return (
    <section className="mt-20 space-y-8 px-4 sm:px-9">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {error && <p className="text-red-400">{error}</p>}
      {message && <p className="text-green-400">{message}</p>}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Create New Event */}
        <div>
          <h2 className="text-xl mb-3">Create Event</h2>
          <form onSubmit={handleCreate} className="glass border border-primary/20 p-4 rounded-xl space-y-3">
            <input className="input" placeholder="Title" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} required />
            <textarea className="input" placeholder="Description" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} required />
            <textarea className="input" placeholder="Overview" value={createForm.overview} onChange={(e) => setCreateForm({ ...createForm, overview: e.target.value })} required />
            <input className="input" placeholder="Venue" value={createForm.venue} onChange={(e) => setCreateForm({ ...createForm, venue: e.target.value })} required />
            <input className="input" placeholder="Location" value={createForm.location} onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })} required />
            <div className="flex gap-3">
              <input className="input" placeholder="YYYY-MM-DD" value={createForm.date} onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })} required />
              <input className="input" placeholder="HH:mm" value={createForm.time} onChange={(e) => setCreateForm({ ...createForm, time: e.target.value })} required />
            </div>
            <div className="flex gap-3">
              <input className="input" placeholder="Mode (online/offline)" value={createForm.mode} onChange={(e) => setCreateForm({ ...createForm, mode: e.target.value })} required />
              <input className="input" placeholder="Audience" value={createForm.audience} onChange={(e) => setCreateForm({ ...createForm, audience: e.target.value })} required />
            </div>
            <input className="input" placeholder="Organizer" value={createForm.organizer} onChange={(e) => setCreateForm({ ...createForm, organizer: e.target.value })} required />
            <input className="input" placeholder="Tags (comma separated)" value={createForm.tags.join(", ")} onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
            <input className="input" placeholder="Agenda (comma separated)" value={createForm.agenda.join(", ")} onChange={(e) => setCreateForm({ ...createForm, agenda: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
            <input className="input" type="file" accept="image/*" onChange={(e) => setCreateFile(e.target.files?.[0] || null)} />
            <button className="px-4 py-2 bg-primary text-dark-100 rounded" disabled={loading}>
              {loading ? "Saving..." : "Create"}
            </button>
          </form>
        </div>

        {/* Events list */}
        <div>
          <h2 className="text-xl mb-3">Your Events</h2>
          <div className="space-y-3">
            {formattedEvents.map((ev) => (
              <div key={ev.slug} className="glass border border-primary/20 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{ev.title}</p>
                    <p className="text-sm opacity-75">{ev.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="underline" onClick={() => startEdit(ev)}>Edit</button>
                    <button className="underline text-red-400" onClick={() => handleDelete(ev.slug)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {formattedEvents.length === 0 && <p className="opacity-75">No events yet.</p>}
          </div>
        </div>
      </div>

      {/* Edit Modal (simple inline block) */}
      {editingSlug && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl glass border border-primary/20 p-4 rounded-xl space-y-3 bg-dark-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Edit Event</h3>
              <button onClick={() => setEditingSlug(null)} className="text-sm underline">Close</button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-3">
              <input className="input" placeholder="Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
              <textarea className="input" placeholder="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} required />
              <textarea className="input" placeholder="Overview" value={editForm.overview} onChange={(e) => setEditForm({ ...editForm, overview: e.target.value })} required />
              <input className="input" placeholder="Venue" value={editForm.venue} onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })} required />
              <input className="input" placeholder="Location" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} required />
              <div className="flex gap-3">
                <input className="input" placeholder="YYYY-MM-DD" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} required />
                <input className="input" placeholder="HH:mm" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} required />
              </div>
              <div className="flex gap-3">
                <input className="input" placeholder="Mode (online/offline)" value={editForm.mode} onChange={(e) => setEditForm({ ...editForm, mode: e.target.value })} required />
                <input className="input" placeholder="Audience" value={editForm.audience} onChange={(e) => setEditForm({ ...editForm, audience: e.target.value })} required />
              </div>
              <input className="input" placeholder="Organizer" value={editForm.organizer} onChange={(e) => setEditForm({ ...editForm, organizer: e.target.value })} required />
              <input className="input" placeholder="Tags (comma separated)" value={editForm.tags.join(", ")} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
              <input className="input" placeholder="Agenda (comma separated)" value={editForm.agenda.join(", ")} onChange={(e) => setEditForm({ ...editForm, agenda: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
              <input className="input" type="file" accept="image/*" onChange={(e) => setEditFile(e.target.files?.[0] || null)} />
              <button className="px-4 py-2 bg-primary text-dark-100 rounded">Update</button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .input { width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.5rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(93,254,202,0.3); outline: none; }
      `}</style>
    </section>
  );
};

export default DashboardPage;
