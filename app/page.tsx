import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { upcomingEvents as events } from "@/lib/events";

const Home = () => {
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
          {events.map((event) => (
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
