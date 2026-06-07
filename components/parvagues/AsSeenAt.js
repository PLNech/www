const credentials = [
  { name: 'TOPLAP', detail: '20 Years', url: 'https://blog.toplap.org/2024/01/20/toplap20-events-feb-23-25/' },
  { name: 'Algorave', detail: 'GZ Lyon', url: 'https://algorave.com/' },
  { name: 'Opal Festival', detail: '2024 · 2025', url: 'https://www.opal-festival.com/' },
  { name: 'Cookie Collective', detail: 'Compilation', url: 'https://ccc.cookie.paris/projects/ugo-parvague/' },
  { name: '38C3', detail: 'House of Tea', url: 'https://soundcloud.com/parvagues/live-38c3-house-of-tea' },
  { name: '39C3', detail: 'House of Tea', url: 'https://soundcloud.com/parvagues/live-39c3' },
];

export default function AsSeenAt() {
  return (
    <div className="py-10 border-y border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-6">
        <p
          className="text-[10px] tracking-[0.25em] uppercase text-center mb-6"
          style={{ color: 'var(--text-muted)' }}
        >
          As seen at
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-5 md:gap-x-8 gap-y-3">
          {credentials.map(({ name, detail, url }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline gap-1.5 transition-colors duration-200"
            >
              <span
                className="font-display font-bold text-sm md:text-base tracking-wide text-white/40 group-hover:text-[var(--neon-high)] transition-colors duration-200"
              >
                {name}
              </span>
              {detail && (
                <span className="text-[10px] tracking-wider text-white/20 group-hover:text-white/40 transition-colors duration-200">
                  {detail}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
