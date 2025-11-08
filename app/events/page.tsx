import EventCard from "@/components/EventCard";
import { allEvents as staticAll } from "@/lib/events";

const EventsPage = async () => {
  // Try to fetch dynamic events from the API; fall back to static list on failure
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  const apiUrl = `${base ? `${base}` : ""}/api/events`;

  let events: any[] = staticAll;
  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.events) && data.events.length > 0) {
        events = data.events;
      }
    }
  } catch {}

  return (
    <section className="mt-20 space-y-7 px-4 sm:px-9">
      <h1>All Events</h1>
      <ul className="events px-3 list-none">
        {events.map((event) => (
          <li key={event.slug || event.title}>
            <EventCard {...event} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default EventsPage;
