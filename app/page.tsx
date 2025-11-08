import EventCard from "@/components/EventCard";
import Hero from "@/components/Hero";
import { upcomingEvents as staticEvents } from "@/lib/events";
import { cacheLife } from "next/cache";

const Home = async () => {
  "use cache";
  cacheLife("hours");

  const base = process.env.NEXT_PUBLIC_BASE_URL;
  const apiUrl = `${base ? `${base}` : ""}/api/events`;

  // Try to fetch dynamic events for the Featured list; fall back to static
  let featured = staticEvents;
  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.events) && data.events.length > 0) {
        // Show the most recent 6 events
        featured = data.events.slice(0, 6);
      }
    }
  } catch {}

  return (
    <>
      <Hero />
      <section id="events" className="mt-20 space-y-7 px-4 sm:px-9">
        <h3 className="text-center sm:text-left">Featured Events</h3>
        <ul className="events px-3 list-none">
          {featured &&
            featured.length > 0 &&
            featured.map((event: any) => (
              <li key={event.slug || event.title}>
                <EventCard {...event} />
              </li>
            ))}
        </ul>
      </section>
    </>
  );
};

export default Home;
