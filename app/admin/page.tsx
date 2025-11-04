import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Tabs from "@/components/AdminTabs";
import connectDB from "@/lib/mongodb";
import { Booking, Event, User, Order, Coupon, Organization } from "@/database";
import { sendMail } from "@/lib/email";
import dynamic from "next/dynamic";
import { uploadToCloudinary } from "@/lib/cloudinary";

const EventManagerWrapper = dynamic(() => import("../../components/admin/EventManager"));
const OrderManagerWrapper = dynamic(() => import("../../components/admin/OrderManager"));
const CouponManagerWrapper = dynamic(() => import("../../components/admin/CouponManager"));
const TicketManagerWrapper = dynamic(() => import("../../components/admin/TicketManager"));


async function UsersPanel() {
  await connectDB();
  const [users, events] = await Promise.all([
    User.find().sort({ createdAt: -1 }).lean(),
    Event.find().sort({ createdAt: -1 }).select("title date time _id").lean()
  ]);

  async function deleteUser(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/admin/users/${id}`, { method: "DELETE", cache: "no-store" });
  }

  async function suspendUser(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    const days = Number(formData.get("days") || 0);
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ days }),
      cache: "no-store",
    });
  }

  async function emailUser(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    const eventId = String(formData.get("eventId") || "");
    const prompt = String(formData.get("prompt") || "");
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/admin/users/${id}/email`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ eventId, customPrompt: prompt }),
      cache: "no-store",
    });
  }

  const isSuspended = (u: any) => u.suspendedUntil && new Date(u.suspendedUntil).getTime() > Date.now();

  return (
    <div className="glass p-4 rounded-md">
      <h3 className="mb-3">All Users</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-light-200">
            <tr>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Joined</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={String(u._id)} className="border-t border-dark-200 align-top">
                <td className="py-2 pr-4">{u.name}</td>
                <td className="py-2 pr-4">{u.email}</td>
                <td className="py-2 pr-4">{u.role}</td>
                <td className="py-2 pr-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="py-2 pr-4">{isSuspended(u) ? `Suspended until ${new Date(u.suspendedUntil).toLocaleDateString()}` : "Active"}</td>
                <td className="py-2 pr-4">
                  <div className="flex flex-col gap-2 min-w-[320px]">
                    <form action={deleteUser}>
                      <input type="hidden" name="id" value={String(u._id)} />
                      <button className="text-red-400 hover:underline" aria-label={`Delete ${u.email}`}>Delete</button>
                    </form>
                    <form action={suspendUser} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={String(u._id)} />
                      <input name="days" type="number" min={0} defaultValue={isSuspended(u) ? 0 : 7} className="w-20 bg-dark-200 rounded px-2 py-1" aria-label="Days" />
                      <button className="glass px-2 py-1 rounded">{isSuspended(u) ? "Unsuspend" : "Suspend"}</button>
                    </form>
                    <form action={emailUser} className="flex flex-col gap-2">
                      <input type="hidden" name="id" value={String(u._id)} />
                      <select name="eventId" className="bg-dark-200 rounded px-2 py-1">
                        {events.map((e: any) => (
                          <option key={String(e._id)} value={String(e._id)}>{e.title} — {e.date}</option>
                        ))}
                      </select>
                      <input name="prompt" placeholder="Optional AI prompt" className="bg-dark-200 rounded px-2 py-1" />
                      <button className="bg-primary text-black rounded px-2 py-1">Send AI Mail</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type AdminEventInput = {
  title: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
};

async function BookingsPanel() {
  await connectDB();
  const bookings = await Booking.aggregate([
    { $lookup: { from: "events", localField: "eventId", foreignField: "_id", as: "event" } },
    { $unwind: "$event" },
    { $sort: { createdAt: -1 } },
  ]);
  const orgs = await Organization.find().select("_id name").lean();

  async function createEvent(formData: FormData) {
    "use server";
    const orgId = formData.get("orgId");
    
    // Handle image file upload
    let imageUrl = "";
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = await uploadToCloudinary(buffer);
    }
    
    const payload: any = {
      title: String(formData.get("title") || ""),
      description: String(formData.get("description") || ""),
      overview: String(formData.get("overview") || ""),
      image: imageUrl,
      venue: String(formData.get("venue") || ""),
      location: String(formData.get("location") || ""),
      date: String(formData.get("date") || ""),
      time: String(formData.get("time") || ""),
      mode: String(formData.get("mode") || ""),
      audience: String(formData.get("audience") || ""),
      agenda: String(formData.get("agenda") || "").split("\n").filter(Boolean),
      organizer: String(formData.get("organizer") || ""),
      tags: String(formData.get("tags") || "").split(",").map(t => t.trim()).filter(Boolean),
    };
    if (orgId && String(orgId)) {
      payload.orgId = String(orgId);
    }
    await Event.create(payload);
  }

  return (
    <div className="space-y-6">
      <form action={createEvent} className="glass p-4 rounded-md grid grid-cols-1 md:grid-cols-2 gap-3">
        <h3 className="md:col-span-2">Create New Event</h3>
        <input name="title" placeholder="Title" required className="bg-dark-200 rounded px-4 py-2" />
        <input name="image" type="file" accept="image/*" required className="bg-dark-200 rounded px-4 py-2" />
        <select name="orgId" className="bg-dark-200 rounded px-4 py-2 md:col-span-2">
          <option value="">No Organization</option>
          {orgs.map((org: any) => (
            <option key={String(org._id)} value={String(org._id)}>{org.name}</option>
          ))}
        </select>
        <input name="venue" placeholder="Venue" required className="bg-dark-200 rounded px-4 py-2" />
        <input name="location" placeholder="Location" required className="bg-dark-200 rounded px-4 py-2" />
        <input name="date" placeholder="YYYY-MM-DD" required className="bg-dark-200 rounded px-4 py-2" />
        <input name="time" placeholder="HH:mm or 1:00 PM" required className="bg-dark-200 rounded px-4 py-2" />
        <input name="mode" placeholder="online | offline | hybrid" required className="bg-dark-200 rounded px-4 py-2" />
        <input name="audience" placeholder="Audience" required className="bg-dark-200 rounded px-4 py-2" />
        <input name="organizer" placeholder="Organizer" required className="bg-dark-200 rounded px-4 py-2" />
        <input name="tags" placeholder="tags,comma,separated" required className="bg-dark-200 rounded px-4 py-2" />
        <textarea name="description" placeholder="Short description" required className="bg-dark-200 rounded px-4 py-2 md:col-span-2" />
        <textarea name="overview" placeholder="Overview" required className="bg-dark-200 rounded px-4 py-2 md:col-span-2" />
        <textarea name="agenda" placeholder="Agenda (one per line)" required className="bg-dark-200 rounded px-4 py-2 md:col-span-2" />
        <div className="md:col-span-2 flex justify-end">
          <button className="bg-primary text-black rounded px-4 py-2">Create Event</button>
        </div>
      </form>

      <div className="glass p-4 rounded-md">
        <h3 className="mb-3">Event Bookings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-light-200">
              <tr>
                <th className="py-2 pr-4">Event</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Attendee Email</th>
                <th className="py-2 pr-4">Booked</th>
                <th className="py-2 pr-4">Reminder</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b: any) => (
                <tr key={String(b._id)} className="border-t border-dark-200">
                  <td className="py-2 pr-4">{b.event.title}</td>
                  <td className="py-2 pr-4">{b.event.date} {b.event.time}</td>
                  <td className="py-2 pr-4">{b.email}</td>
                  <td className="py-2 pr-4">{new Date(b.createdAt).toLocaleString()}</td>
                  <td className="py-2 pr-4">{b.reminderSentAt ? new Date(b.reminderSentAt).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

async function EmailPanel() {
  await connectDB();
  const events = await Event.find().sort({ createdAt: -1 }).select("title date time location _id").lean();

  async function sendEmail(formData: FormData) {
    "use server";
    const target = String(formData.get("target") || "custom");
    const subject = String(formData.get("subject") || "");
    const body = String(formData.get("body") || "");

    let recipients: string[] = [];
    if (target === "custom") {
      recipients = String(formData.get("to") || "").split(",").map(s => s.trim()).filter(Boolean);
    } else if (target === "allUsers") {
      const users = await User.find().select("email").lean();
      recipients = users.map((u: any) => u.email);
    } else if (target === "allBookings") {
      const bookings = await Booking.find().select("email").lean();
      recipients = Array.from(new Set(bookings.map((b: any) => b.email)));
    }

    if (recipients.length === 0) return;
    await sendMail({ to: recipients, subject, html: `<div>${body}</div>`, text: body });
  }

  async function sendAI(formData: FormData) {
    "use server";
    const eventId = String(formData.get("eventId") || "");
    const customPrompt = String(formData.get("prompt") || "");
    // Call internal API to leverage AI generator + attendee list
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/admin/email/send`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ useAI: true, eventId, customPrompt }),
      cache: "no-store",
    });
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form action={sendEmail} className="glass p-4 rounded-md flex flex-col gap-3">
        <h3>Manual Email</h3>
        <select name="target" className="bg-dark-200 rounded px-4 py-2">
          <option value="custom">Custom List</option>
          <option value="allUsers">All Users (database)</option>
          <option value="allBookings">All Booking Emails (unique)</option>
        </select>
        <input name="to" placeholder="comma,separated,emails (used when Custom)" className="bg-dark-200 rounded px-4 py-2" />
        <input name="subject" placeholder="Subject" className="bg-dark-200 rounded px-4 py-2" />
        <textarea name="body" placeholder="Body (HTML/Text)" className="bg-dark-200 rounded px-4 py-2 min-h-40" />
        <button className="bg-primary text-black rounded px-4 py-2">Send</button>
      </form>

      <form action={sendAI} className="glass p-4 rounded-md flex flex-col gap-3">
        <h3>AI Reminder (Gemini)</h3>
        <select name="eventId" className="bg-dark-200 rounded px-4 py-2">
          {events.map((e: any) => (
            <option key={String(e._id)} value={String(e._id)}>
              {e.title} — {e.date} {e.time}
            </option>
          ))}
        </select>
        <textarea name="prompt" placeholder="Extra instructions for Gemini (optional)" className="bg-dark-200 rounded px-4 py-2 min-h-40" />
        <button className="bg-primary text-black rounded px-4 py-2">Generate & Send to Attendees</button>
      </form>
    </div>
  );
}


async function OrganizationsPanel() {
  await connectDB();
  const orgs = await Organization.find()
    .populate("ownerId", "name email")
    .populate("members.userId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="glass p-4 rounded-md">
      <h3 className="mb-3">All Organizations</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-light-200">
            <tr>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Slug</th>
              <th className="py-2 pr-4">Owner</th>
              <th className="py-2 pr-4">Members</th>
              <th className="py-2 pr-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org: any) => (
              <tr key={String(org._id)} className="border-t border-dark-200">
                <td className="py-2 pr-4">{org.name}</td>
                <td className="py-2 pr-4 font-mono">{org.slug}</td>
                <td className="py-2 pr-4">{org.ownerId?.name || "N/A"}</td>
                <td className="py-2 pr-4">{org.members.length}</td>
                <td className="py-2 pr-4">{new Date(org.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function AdminContent({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as SessionUser | undefined)?.role;
  if (role !== "superadmin") redirect("/dashboard");

  const sp = await searchParams;
  const tab = (sp?.tab ?? "users") as "users" | "bookings" | "email" | "events" | "orders" | "coupons" | "tickets" | "orgs";

  return (
    <main className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1>Superadmin</h1>
          <p className="mt-2 text-light-100">Manage users, bookings and communication</p>
        </div>
      </div>

      <Tabs initial={tab} />

      <section className="space-y-8">
        {tab === "users" && (
          <Suspense fallback={<div>Loading users…</div>}>
            <UsersPanel />
          </Suspense>
        )}
        {tab === "bookings" && (
          <Suspense fallback={<div>Loading bookings…</div>}>
            <BookingsPanel />
          </Suspense>
        )}
        {tab === "email" && (
          <Suspense fallback={<div>Loading email center…</div>}>
            <EmailPanel />
          </Suspense>
        )}
        {tab === "events" && (
          <Suspense fallback={<div>Loading events…</div>}>
            <EventManagerWrapper />
          </Suspense>
        )}
        {tab === "orders" && (
          <Suspense fallback={<div>Loading orders…</div>}>
            <OrderManagerWrapper />
          </Suspense>
        )}
        {tab === "coupons" && (
          <Suspense fallback={<div>Loading coupons…</div>}>
            <CouponManagerWrapper />
          </Suspense>
        )}
        {tab === "tickets" && (
          <Suspense fallback={<div>Loading tickets…</div>}>
            <TicketManagerWrapper />
          </Suspense>
        )}
        {tab === "orgs" && (
          <Suspense fallback={<div>Loading organizations…</div>}>
            <OrganizationsPanel />
          </Suspense>
        )}
      </section>
    </main>
  );
}

export default function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <Suspense fallback={<div className="p-6">Loading admin…</div>}>
      {/* Pass searchParams via URL; AdminContent reads it */}
      {/* @ts-expect-error Async Server Component */}
      <AdminContent searchParams={searchParams} />
    </Suspense>
  );
}
