export type EventItem = {
  image?: string;
  title: string;
  slug?: string;
  location?: string;
  date?: string; // human friendly date string (kept for display)
  time?: string;
  // parsedDate is a Date instance used for filtering/sorting; may be null if parsing failed or absent
  parsedDate?: Date | null;
};

// Raw events data (moved from app/page.tsx). Keep date as a human string where available.
const events: EventItem[] = [
  {
    image: "/images/event1.png",
    title: "Tech Conference 2026",
    slug: "tech-conference-2026",
    location: "San Francisco, CA, USA",
    date: "January 15-17, 2026",
    time: "9:00 AM - 6:00 PM",
  },
  {
    image: "/images/event2.png",
    title: "AI & ML Summit 2025",
    slug: "ai-ml-summit-2025",
    location: "London, UK",
    date: "November 12, 2025",
    time: "10:00 AM - 5:00 PM",
  },
  {
    image: "/images/event3.png",
    title: "Web Dev Workshop",
    slug: "web-dev-workshop-2025",
    location: "Remote (Online)",
    date: "September 10, 2025",
    time: "1:00 PM - 4:00 PM (UTC)",
  },
  {
    image: "/images/event4.png",
    title: "Cloud Computing Expo",
    slug: "cloud-computing-expo-2025",
    location: "New York, NY, USA",
    date: "December 3-4, 2025",
    time: "9:30 AM - 5:30 PM",
  },
  {
    image: "/images/event5.png",
    title: "Cybersecurity Forum 2025",
    slug: "cybersecurity-forum-2025",
    location: "Berlin, Germany",
    date: "March 2, 2025",
    time: "9:00 AM - 3:00 PM",
  },
  {
    image: "/images/event6.png",
    title: "Frontend Masters Meetup",
    slug: "frontend-masters-meetup-2025",
    location: "Berlin, Germany",
    date: "November 28, 2025",
    time: "6:00 PM - 9:00 PM",
  },
  {
    image: "/images/event5.png",
    title: "DevOps Days",
    slug: "devops-days-2026",
    location: "Amsterdam, Netherlands",
    date: "February 20, 2026",
    time: "9:00 AM - 5:00 PM",
  },
];

// Try to parse a variety of human-friendly date strings into a Date object.
// Strategy: if the string contains a range like "March 15-17, 2024" use the start date.
// Fall back to Date.parse for ISO-like strings. If parsing fails, return null.
function parseDateString(dateStr?: string): Date | null {
  if (!dateStr) return null;

  // match patterns like "March 15-17, 2024" or "Mar 15, 2025"
  const rangeMatch = dateStr.match(
    /([A-Za-z]+)\s+(\d{1,2})(?:[-–]\d{1,2})?,?\s*(\d{4})/
  );
  if (rangeMatch) {
    const [, monthName, day, year] = rangeMatch;
    const candidate = new Date(`${monthName} ${day}, ${year}`);
    if (!isNaN(candidate.getTime())) return candidate;
  }

  // try ISO / loose parse
  const iso = Date.parse(dateStr);
  if (!isNaN(iso)) return new Date(iso);

  return null;
}

// attach parsedDate to each event (non-destructive copy) and ensure required display fields
const eventsWithParsed: EventItem[] = events.map((e) => ({
  ...e,
  // ensure we always have an image string to match components that expect it
  image: e.image ?? "/images/default.png",
  parsedDate: parseDateString(e.date) ?? null,
}));

// Now filter to upcoming events only (parsedDate in the future). Use local system time.
const now = new Date();
export const upcomingEvents: EventItem[] = eventsWithParsed.filter(
  (e) =>
    e.parsedDate !== null && (e.parsedDate as Date).getTime() >= now.getTime()
);

// Also export the raw list and helper for convenience
export const allEvents = eventsWithParsed;

export default allEvents;
