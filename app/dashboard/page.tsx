import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Booking, Event, type IEvent } from "@/database";
import connectDB from "@/lib/mongodb";
import type { SessionUser } from "@/lib/auth";
import Image from "next/image";
import { Suspense } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

type EventLean = IEvent & { _id: unknown; slug?: string };

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

async function AdminControls() {
  await connectDB();
  const [events, totalEvents, totalBookings] = await Promise.all([
    Event.find().sort({ createdAt: -1 }).lean<EventLean[]>(),
    Event.countDocuments(),
    Booking.countDocuments(),
  ]);

  async function deleteEvent(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    const session = await getServerSession(authOptions);
    const role = (session?.user as SessionUser | undefined)?.role;
    if (role !== "superadmin") return;
    await connectDB();
    await Event.findByIdAndDelete(id);
  }

  async function createEvent(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    const role = (session?.user as SessionUser | undefined)?.role;
    if (role !== "superadmin") return;
    await connectDB();
    
    // Handle image file upload
    let imageUrl = "";
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = await uploadToCloudinary(buffer);
    }
    
    const payload: AdminEventInput = {
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
      tags: String(formData.get("tags") || "").split(",").map((t) => t.trim()).filter(Boolean),
    };
    await Event.create(payload);
  }

  return (
    <section className="w-full space-y-8">
      <div className="flex items-center justify-between">
        <h2>Admin controls</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass p-4 rounded-md">
          <p className="text-light-200 text-sm">Total Events</p>
          <p className="text-3xl font-semibold mt-1">{totalEvents}</p>
        </div>
        <div className="glass p-4 rounded-md">
          <p className="text-light-200 text-sm">Total Bookings</p>
          <p className="text-3xl font-semibold mt-1">{totalBookings}</p>
        </div>
        <div className="glass p-4 rounded-md">
          <p className="text-light-200 text-sm">Latest Event</p>
          <p className="font-semibold mt-1 line-clamp-1">{events[0]?.title ?? "—"}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <form action={createEvent} className="glass p-4 rounded-md flex flex-col gap-3">
          <h3>Create event</h3>
          <input name="title" placeholder="Title" required className="bg-dark-200 rounded-[6px] px-5 py-2.5" />
          <textarea name="description" placeholder="Short description" required className="bg-dark-200 rounded-[6px] px-5 py-2.5" />
          <textarea name="overview" placeholder="Overview" required className="bg-dark-200 rounded-[6px] px-5 py-2.5" />
          <input name="image" type="file" accept="image/*" required className="bg-dark-200 rounded-[6px] px-5 py-2.5" />
          <input name="venue" placeholder="Venue" required className="bg-dark-200 rounded-[6px] px-5 py-2.5" />
          <input name="location" placeholder="Location" required className="bg-dark-200 rounded-[6px] px-5 py-2.5" />
          <input name="date" placeholder="YYYY-MM-DD" required className="bg-dark-200 rounded-[6px] px-5 py-2.5" />
          <input name="time" placeholder="HH:mm or 1:00 PM" required className="bg-dark-200 rounded-[6px] px-5 py-2.5" />
          <input name="mode" placeholder="online | offline | hybrid" required className="bg-dark-200 rounded-[6px] px-5 py-2.5" />
          <input name="audience" placeholder="Audience" required className="bg-dark-200 rounded-[6px] px-5 py-2.5" />
          <textarea name="agenda" placeholder="Agenda (one per line)" required className="bg-dark-200 rounded-[6px] px-5 py-2.5" />
          <input name="organizer" placeholder="Organizer" required className="bg-dark-200 rounded-[6px] px-5 py-2.5" />
          <input name="tags" placeholder="tags,comma,separated" required className="bg-dark-200 rounded-[6px] px-5 py-2.5" />
          <button type="submit" className="bg-primary hover:bg-primary/90 w-full rounded-[6px] px-4 py-2.5 text-lg font-semibold text-black">Create</button>
        </form>

        <div className="space-y-4">
          <h3>Existing events</h3>
          <ul className="mt-2 flex flex-col gap-3">
            {events.map((e: EventLean) => (
              <li key={String(e._id)} className="glass p-3 rounded-md flex items-center justify-between">
                <div>
                  <p className="font-semibold">{e.title}</p>
                  <p className="text-sm text-light-200">/{e.slug}</p>
                </div>
                <form action={deleteEvent}>
                  <input type="hidden" name="id" value={String(e._id)} />
                  <button className="text-red-400">Delete</button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <h3>Recent events</h3>
        <div className="events">
          {events.slice(0, 6).map((e) => (
            <div key={String(e._id)} id="event-card">
              {/* Image */}
              <Image src={e.image} alt={e.title} width={410} height={300} className="poster" />
              {/* Location */}
              <div className="flex flex-row gap-2">
                <Image src="/icons/pin.svg" alt="location" width={14} height={14} />
                <p>{e.location}</p>
              </div>
              {/* Title */}
              <a href={`/events/${e.slug}`} className="title hover:underline">{e.title}</a>
              {/* Date */}
              <div className="datetime">
                <Image src="/icons/calendar.svg" alt="date" width={14} height={14} />
                <p>{e.date}</p>
              </div>
              {/* Time */}
              <div className="datetime">
                <Image src="/icons/clock.svg" alt="time" width={14} height={14} />
                <p>{e.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function DashboardContent() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = (session.user as SessionUser | undefined)?.role as string;

  async function signOutAction() {
    "use server";
    redirect("/api/auth/signout");
  }

  return (
    <main>
      <div className="flex items-center justify-between">
        <div>
          <h1>Dashboard</h1>
          <p className="mt-2 text-light-100">Welcome {(session.user as SessionUser | undefined)?.name || "User"}</p>
        </div>
        <form action={signOutAction}>
          <button className="glass px-4 py-2 rounded-md">Sign out</button>
        </form>
      </div>

      {role === "superadmin" ? (
        <section className="mt-10 glass p-4 rounded-md">
          <h3>Superadmin</h3>
          <p className="mt-2 text-light-100">You have elevated access. Go to the dedicated admin console.</p>
          <a href="/admin" className="inline-block mt-3 bg-primary text-black rounded px-4 py-2">Open Admin Console</a>
        </section>
      ) : (
        <section className="mt-10">
          <h3>Your access</h3>
          <p className="mt-2 text-light-100">You can browse and book events. Contact admin for elevated access.</p>
        </section>
      )}
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading dashboard…</div>}>
      <DashboardContent />
    </Suspense>
  );
}
