import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 40%, rgba(217,0,255,0.06) 0%, transparent 60%)' }} />

      <div className="relative z-10 text-center px-6 w-full flex flex-col items-center">
        <div className="relative w-48 h-48 md:w-72 md:h-72 mb-8">
          <Image
            src="/images/parvagues/logo_transparent.png"
            alt="ParVagues"
            fill
            className="object-contain"
            style={{ filter: 'drop-shadow(0 0 40px rgba(217,0,255,0.25))' }}
            priority
          />
        </div>
        <h1
          className="font-display font-extrabold leading-none tracking-[0.15em] uppercase"
          style={{ fontSize: 'clamp(1.5rem, 5vw, 3.5rem)', textShadow: '0 0 60px rgba(217,0,255,0.15)' }}
        >
          ParVagues
        </h1>
        <div className="mx-auto mt-6 mb-6" style={{ width: '6rem', height: '1px', background: 'linear-gradient(to right, transparent, rgba(217,0,255,0.4), transparent)' }} />
        <p className="text-base md:text-lg italic leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          Des ondes qui naissent dans un oc&eacute;an binaire pour parfois s&apos;&eacute;chouer sur vos plages sonores.
        </p>
        <div className="mt-14 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="#tour" className="inline-block px-8 py-3.5 bg-white font-display font-bold text-sm tracking-widest uppercase rounded-full transition-all duration-300 hover:shadow-lg" style={{ color: 'var(--surface)' }}>On Tour</a>
          <a href="#music" className="inline-block px-8 py-3.5 border border-white/25 text-white font-display font-bold text-sm tracking-widest uppercase rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300">&Eacute;couter</a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <div className="animate-pulse" style={{ width: '1px', height: '3rem', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))' }} />
      </div>
    </section>
  );
}
