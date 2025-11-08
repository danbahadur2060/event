export default function LoadingEvents() {
  return (
    <section className="mt-20 space-y-7 px-4 sm:px-9">
      <h1>All Events</h1>
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse glass border border-primary/20 rounded-xl h-24"
          />
        ))}
      </div>
    </section>
  );
}
