import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { upcomingEvents as staticEvents, type EventItem } from "@/lib/events";
import { Suspense } from "react";

type ApiEvent = {
  _id: string;
  title: string;
  slug: string;
  image: string;
  location: string;
  date: string;
  time: string;
};

function EventsFallback() {
  return (
    <div className="mt-20 space-y-7 px-9">
      <h3>Featured Events</h3>
      <ul className="events px-3 list-none">
        {staticEvents.slice(0, 6).map((event) => (
          <li key={event.title}>
            {/* EventCard expects ApiEvent shape; static has compatible fields */}
            <EventCard {...(event as unknown as ApiEvent)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

async function DynamicEvents() {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  const apiUrl = `${base ? `${base}` : ""}/api/events`;

  let events: ApiEvent[] = [];
  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { events?: ApiEvent[] };
      events = Array.isArray(data?.events) ? data.events : [];
    }
  } catch {}

  const hasDynamic = events.length > 0;
  const featured: Array<ApiEvent | EventItem> = hasDynamic
    ? events.slice(0, 6)
    : staticEvents.slice(0, 6);

  return (
    <div className="mt-20 space-y-7 px-9">
      <h3>{hasDynamic ? "Latest Events" : "Featured Events"}</h3>
      <ul className="events px-3 list-none">
        {featured.map((event) => (
          <li key={(event as ApiEvent)._id ?? event.title}>
            <EventCard {...(event as unknown as ApiEvent)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

const Home = () => {
  return (
    <section id="home">
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event you can&rsquo;t Miss
      </h1>
      <p className="subheading">
        Hackathons, Meetups, and Conferences — All in One Place
      </p>
      <div className="mt-6 flex justify-center">
        <ExploreBtn />
      </div>

      <Suspense fallback={<EventsFallback />}>
        <DynamicEvents />
      </Suspense>
    </section>
  );
};

export default Home;
