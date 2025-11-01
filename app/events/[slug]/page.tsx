import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database";
import { getSimilarEventsBySlug } from "@/lib/actions/event.action";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic"; // ensure fresh server fetches for dynamic event pages

type EventResponse = {
  event: {
    description?: string | null;
    image?: string | null;
    overview?: string | null;
    date?: string | null;
    time?: string | null;
    location?: string | null;
    mode?: string | null;
    agenda?: string[] | null;
    tags?: string[] | null;
    audience?: string | null;
    organizer?: string | null;
  };
};

const EventDetailsItems = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label?: string | null;
}) => (
  <div className="flex flex-row gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label ?? "—"}</p>
  </div>
);

const EventAgendaItem = ({ agendaItems }: { agendaItems: string[] }) => {
  if (!agendaItems || agendaItems.length === 0) return null;
  return (
    <div className="agenda">
      <h2>Agenda</h2>
      <ul>
        {agendaItems.map((item, idx) => (
          <li key={`${item}-${idx}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

const EventTags = ({ tags }: { tags: string[] }) => {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-row gap-1.5 flex-wrap">
      {tags.map((tag) => (
        <div className="pill" key={tag}>
          {tag}
        </div>
      ))}
    </div>
  );
};

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { slug } = await params;

  // quick sanity
  if (!slug) return notFound();

  if (!BASE_URL) {
    // configure NEXT_PUBLIC_BASE_URL in your environment
    return notFound();
  }

  // server-side fetch; avoid stale cache for dynamic event pages
  const res = await fetch(
    `${BASE_URL}/api/events/${encodeURIComponent(slug)}`,
    {
      // adjust caching if you want ISR or revalidation
      cache: "no-store",
    }
  );

  if (!res.ok) return notFound();

  const data: EventResponse = await res.json();
  const event = data?.event;

  if (!event || !event.description) return notFound();

  const {
    description,
    image,
    overview,
    date,
    time,
    location,
    mode,
    agenda = [],
    tags = [],
    audience,
    organizer,
  } = event;

  const bookings = 10;

  const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>

      <div className="details mt-10 flex gap-6">
        {/* left side event */}
        <div className="content w-full max-w-3xl">
          {image ? (
            // If your image is from an external host, add the domain to next.config.js images.domains
            <Image
              src={String(image)}
              alt="Event Banner"
              width={800}
              height={450}
              className="banner object-cover w-full"
            />
          ) : null}

          <section className="flex flex-col gap-2 mt-4">
            <h2>Overview</h2>
            <p>{overview ?? "No overview available."}</p>
          </section>

          <section className="flex flex-col gap-2 mt-4">
            <h2>Event Details</h2>

            <div className="flex flex-col gap-2">
              <EventDetailsItems
                icon="/icons/calendar.svg"
                alt="calendar"
                label={date ?? undefined}
              />
              <EventDetailsItems
                icon="/icons/clock.svg"
                alt="clock"
                label={time ?? undefined}
              />
              <EventDetailsItems
                icon="/icons/pin.svg"
                alt="location"
                label={location ?? undefined}
              />
              <EventDetailsItems
                icon="/icons/mode.svg"
                alt="mode"
                label={mode ?? undefined}
              />
              <EventDetailsItems
                icon="/icons/audience.svg"
                alt="audience"
                label={audience ?? undefined}
              />
            </div>
          </section>

          <EventAgendaItem agendaItems={agenda ?? []} />

          <section className="flex flex-col gap-2 mt-4">
            <h2>About the Organizer</h2>
            <p>{organizer ?? "Organizer information not available."}</p>
          </section>

          <div className="mt-4">
            <EventTags tags={tags ?? []} />
          </div>
        </div>

        {/* right side - Booking Form */}

        <aside className="booking w-80">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} people who have already booked their spot !
              </p>
            ) : (
              <p className="text-sm">Be the first to book your spot</p>
            )}
            <BookEvent />
          </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        <div className="events">
          {similarEvents.length > 0 &&
            similarEvents.map((similarEvent: IEvent, index) => (
              <EventCard key={index} {...similarEvent} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default EventDetailsPage;
