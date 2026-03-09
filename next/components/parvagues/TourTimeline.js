import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

  const years = Object.keys(grouped).sort((a, b) => b - a);

  years.forEach((y) => {
    grouped[y].sort((a, b) => b._date - a._date);
  });

  return (
    <section id="tour" className="reveal section-alt py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-6">
      <h2 className="font-display text-2xl md:text-3xl font-bold tracking-widest uppercase">
        On Tour
      </h2>
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginTop: '1rem', marginBottom: '3rem' }} />

      {years.map((year) => (
        <div key={year} style={{ marginBottom: '3rem' }}>
          {/* Year */}
          <h3
            className="font-display font-extrabold select-none pointer-events-none"
            style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', color: 'rgba(255,255,255,0.04)', lineHeight: 1, marginBottom: '-0.5rem' }}
          >
            {year}
          </h3>

          {/* Events */}
          <div>
            {grouped[year].map((live) => {
              const isFuture = live._date > now;
              const hasMedia = live.audio || live.video || live.archive;
              const city = live.location?.includes(',')
                ? live.location.split(',')[0].trim()
                : live.location;

              return (
                <Link
                  key={live.slug}
                  href={`/parvagues/live/${live.slug}`}
                  className="group flex items-center gap-4 transition-colors duration-200 hover:bg-white/5"
                  style={{
                    padding: '0.5rem 0.75rem',
                    margin: '0 -0.75rem',
                    borderRadius: '0.5rem',
                    borderLeft: isFuture ? '2px solid rgba(217,0,255,0.5)' : '2px solid transparent',
                  }}
                >
                  {/* Date */}
                  <span
                    className="font-mono flex-shrink-0"
                    style={{ fontSize: '11px', color: 'var(--text-muted)', width: '3.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    {format(live._date, 'dd MMM', { locale: fr })}
                  </span>

                  {/* Title */}
                  <span
                    className="font-display font-semibold flex-grow min-w-0 truncate group-hover:text-white transition-colors duration-200"
                    style={{ fontSize: '0.875rem' }}
                  >
                    {live.title}
                  </span>

                  {/* City - hidden on mobile */}
                  <span
                    className="hidden sm:block flex-shrink-0"
                    style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}
                  >
                    {city}
                  </span>

                  {/* Media dot */}
                  {hasMedia && (
                    <span
                      className="flex-shrink-0 rounded-full"
                      style={{ width: '6px', height: '6px', backgroundColor: 'rgba(217,0,255,0.5)' }}
                      title="Enregistrement disponible"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
      </div>
    </section>
  );
}
