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
          className="object-cover opacity-20"
          priority
        />
        {/* Heavy overlay to kill poster text bleed */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, var(--surface) 0%, rgba(10,10,10,0.85) 40%, rgba(10,10,10,0.85) 60%, var(--surface) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <h1
          className="font-display font-extrabold leading-none tracking-tight"
          style={{
            fontSize: 'clamp(3rem, 15vw, 12rem)',
            textShadow: '0 0 80px rgba(217,0,255,0.2), 0 0 160px rgba(217,0,255,0.08)',
          }}
        >
          ParVagues
        </h1>

        <div
          className="mx-auto mt-8 mb-8"
          style={{ width: '6rem', height: '1px', background: 'linear-gradient(to right, transparent, rgba(217,0,255,0.4), transparent)' }}
        />

        <p className="text-base md:text-lg italic leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          ParVagues, c&apos;est des ondes qui naissent dans un océan binaire
          pour parfois s&apos;échouer sur vos plages sonores.
        </p>

        <div className="mt-14 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="#tour"
            className="inline-block px-8 py-3.5 bg-white font-display font-bold text-sm tracking-widest uppercase rounded-full transition-all duration-300 hover:shadow-lg"
            style={{ color: 'var(--surface)' }}
          >
            On Tour
          </a>
          <a
            href="#music"
            className="inline-block px-8 py-3.5 border border-white/25 text-white font-display font-bold text-sm tracking-widest uppercase rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300"
          >
            Écouter
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <div className="animate-pulse" style={{ width: '1px', height: '3rem', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))' }} />
      </div>
    </section>
  );
}
