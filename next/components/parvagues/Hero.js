import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/parvagues/lives/2024/ccc_release_party/poster.png"
          alt=""
          fill
          className="object-cover opacity-25 filter brightness-75"
          priority
          quality={60}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--surface)] via-[var(--surface)]/70 to-[var(--surface)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <h1
          className="font-display text-[clamp(4rem,15vw,10rem)] font-extrabold leading-[0.85] tracking-tight"
          style={{
            textShadow: '0 0 80px rgba(217,0,255,0.2), 0 0 160px rgba(217,0,255,0.08)',
          }}
        >
          ParVagues
        </h1>

        <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-[var(--neon-high)]/40 to-transparent mt-8 mb-8" />

        <p className="text-base md:text-lg text-[var(--text-muted)] italic leading-relaxed max-w-xl mx-auto">
          ParVagues, c&apos;est des ondes qui naissent dans un océan binaire
          pour parfois s&apos;échouer sur vos plages sonores.
        </p>

        <div className="mt-14 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#tour"
            className="px-8 py-3.5 bg-white text-[var(--surface)] font-display font-bold text-sm tracking-[0.15em] uppercase rounded-full hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-300"
          >
            On Tour
          </a>
          <a
            href="#music"
            className="px-8 py-3.5 border border-white/25 text-white font-display font-bold text-sm tracking-[0.15em] uppercase rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300"
          >
            Écouter
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/30 animate-pulse" />
      </div>
    </section>
  );
}
