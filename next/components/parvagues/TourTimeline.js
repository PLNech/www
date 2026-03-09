import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function MediaDot({ live }) {
  const has = live.audio || live.video || live.archive;
  if (!has) return null;
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-[var(--neon-high)]/60 flex-shrink-0"
      title="Enregistrement disponible"
    />
  );
}

export default function TourTimeline({ lives }) {
  const now = new Date();

  // Group by year, sort desc
  const grouped = {};
  lives.forEach((live) => {
    const d = new Date(live.date + 'T00:00:00');
    const year = d.getFullYear();
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push({ ...live, _date: d });
  });

  const years = Object.keys(grouped)
    .sort((a, b) => b - a);

  // Within each year, sort by date desc
  years.forEach((y) => {
    grouped[y].sort((a, b) => b._date - a._date);
  });

  return (
    <section id="tour" className="max-w-5xl mx-auto px-6 py-24 md:py-32">
      <h2 className="font-display text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase">
        On Tour
      </h2>
      <div className="h-px bg-white/10 mt-4 mb-16" />

      {years.map((year) => (
        <div key={year} className="mb-20 last:mb-0">
          {/* Year watermark */}
          <h3 className="font-display text-[clamp(4rem,12vw,8rem)] font-extrabold text-white/[0.04] leading-none -mb-6 md:-mb-8 select-none pointer-events-none">
            {year}
          </h3>

          {/* Events */}
          <div className="relative">
            {grouped[year].map((live) => {
              const isFuture = live._date > now;
              const city = live.location?.includes(',')
                ? live.location.split(',')[0].trim()
                : live.location;

              return (
                <Link
                  key={live.slug}
                  href={`/parvagues/live/${live.slug}`}
                  className={`group flex items-center gap-3 md:gap-6 py-3 px-3 md:px-4 -mx-3 md:-mx-4 rounded-lg transition-colors duration-200 hover:bg-white/[0.03] ${
                    isFuture ? 'border-l-2 border-[var(--neon-high)]/50 pl-4 md:pl-5' : ''
                  }`}
                >
                  {/* Date */}
                  <span className="text-[11px] font-mono text-[var(--text-muted)] w-14 flex-shrink-0 uppercase tracking-wide">
                    {format(live._date, 'dd MMM', { locale: fr })}
                  </span>

                  {/* Title */}
                  <span className="font-display font-semibold text-sm md:text-base flex-grow min-w-0 truncate group-hover:text-white transition-colors duration-200">
                    {live.title}
                  </span>

                  {/* City */}
                  <span className="text-[11px] text-[var(--text-muted)] hidden sm:block flex-shrink-0 tracking-wide">
                    {city}
                  </span>

                  {/* Media indicator */}
                  <MediaDot live={live} />

                  {/* Arrow */}
                  <svg
                    className="w-4 h-4 text-[var(--text-muted)] group-hover:text-white group-hover:translate-x-1 transition-all duration-200 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                  </svg>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
