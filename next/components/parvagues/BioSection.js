export default function BioSection() {
  return (
    <section className="reveal py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p
          className="text-base md:text-lg leading-relaxed"
          style={{ color: 'var(--text-primary)' }}
        >
          <strong className="font-display">ParVagues</strong> est un projet de{' '}
          <em>livecoding</em> solo — musique électronique composée et jouée en
          temps réel par le code. Algorave, techno, drum &amp; bass, breakbeat :
          chaque set est unique, joué sur scène avec{' '}
          <a
            href="https://tidalcycles.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 decoration-[var(--neon-high)]/40 hover:decoration-[var(--neon-high)] transition-colors"
          >
            TidalCycles
          </a>{' '}
          + MIDI.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {['Algorave', 'Techno', 'DnB', 'Breakbeat', 'Livecoding'].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-[11px] tracking-widest uppercase rounded-full border border-white/10 text-[var(--text-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
