import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database";
import { upcomingEvents as events } from "@/lib/events";
import { cacheLife } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const Home = async () => {
  "use cache";
  cacheLife("hours");
  const response = await fetch(`${BASE_URL}/api/events`);

  const { events } = await response.json();
  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event you can't Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferneces,All in One Place
      </p>
      <ExploreBtn />
      <div className="mt-20 space-y-7 px-9">
        <h3>Fetured Events</h3>
        <ul className="events px-3 list-none">
          {events &&
            events.length > 0 &&
            events.map((event: IEvent) => (
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
