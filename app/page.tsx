import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { upcomingEvents as staticEvents } from "@/lib/events";
import { cacheLife } from "next/cache";

const Home = async () => {
  "use cache";
  cacheLife("hours");

  // Optional: fetch events from API (not used in Featured list yet)
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  const apiUrl = `${base ? `${base}` : ""}/api/events`;
  try {
    await fetch(apiUrl); // fire-and-forget to warm cache; ignore result for now
  } catch {}

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event you can&rsquo;t Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferneces,All in One Place
      </p>
      <ExploreBtn />
      <div className="mt-20 space-y-7 px-9">
        <h3>Featured Events</h3>
        <ul className="events px-3 list-none">
          {staticEvents &&
            staticEvents.length > 0 &&
            staticEvents.map((event) => (
              <li key={event.title}>
                <EventCard {...event} />
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
};

export default Home;
