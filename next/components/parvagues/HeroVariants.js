import Image from 'next/image';

// Variant A: Giant logo as background watermark, very low opacity, centered behind title
export function HeroA() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/images/parvagues/logo_transparent.png"
          alt=""
          width={900}
          height={900}
          className="opacity-[0.07] select-none pointer-events-none"
          style={{ filter: 'blur(1px)' }}
          priority
        />
      </div>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, var(--surface) 70%)' }} />

      <div className="relative z-10 text-center px-6 w-full">
        <h1
          className="font-display font-extrabold leading-none tracking-tight"
          style={{ fontSize: 'clamp(2.5rem, 11vw, 9rem)', textShadow: '0 0 80px rgba(217,0,255,0.2)' }}
        >
          ParVagues
        </h1>
        <div className="mx-auto mt-8 mb-8" style={{ width: '6rem', height: '1px', background: 'linear-gradient(to right, transparent, rgba(217,0,255,0.4), transparent)' }} />
        <p className="text-base md:text-lg italic leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          ParVagues, c&apos;est des ondes qui naissent dans un océan binaire pour parfois s&apos;échouer sur vos plages sonores.
        </p>
        <div className="mt-14 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="#tour" className="inline-block px-8 py-3.5 bg-white font-display font-bold text-sm tracking-widest uppercase rounded-full transition-all duration-300" style={{ color: 'var(--surface)' }}>On Tour</a>
          <a href="#music" className="inline-block px-8 py-3.5 border border-white/25 text-white font-display font-bold text-sm tracking-widest uppercase rounded-full hover:bg-white/10 transition-all duration-300">Écouter</a>
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <div className="animate-pulse" style={{ width: '1px', height: '3rem', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))' }} />
      </div>
    </section>
  );
}

// Variant B: Logo top-right, overlapping edge, neon glow, title left-aligned
export function HeroB() {
  return (
    <section className="relative h-screen flex items-center overflow-hidden">
      <div className="absolute -right-20 -top-20 md:right-[-5%] md:top-[-5%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px]">
        <Image
          src="/images/parvagues/logo_transparent.png"
          alt=""
          fill
          className="object-contain opacity-[0.08] select-none pointer-events-none"
          style={{ filter: 'drop-shadow(0 0 60px rgba(217,0,255,0.15))' }}
          priority
        />
      </div>

      <div className="relative z-10 px-6 md:px-16 max-w-5xl mx-auto w-full">
        <h1
          className="font-display font-extrabold leading-none tracking-tight text-left"
          style={{ fontSize: 'clamp(2.5rem, 11vw, 9rem)', textShadow: '0 0 80px rgba(217,0,255,0.2)' }}
        >
          ParVagues
        </h1>
        <div className="mt-8 mb-8" style={{ width: '6rem', height: '1px', background: 'linear-gradient(to right, rgba(217,0,255,0.4), transparent)' }} />
        <p className="text-base md:text-lg italic leading-relaxed max-w-xl" style={{ color: 'var(--text-muted)' }}>
          ParVagues, c&apos;est des ondes qui naissent dans un océan binaire pour parfois s&apos;échouer sur vos plages sonores.
        </p>
        <div className="mt-14 flex flex-col sm:flex-row gap-4 items-start">
          <a href="#tour" className="inline-block px-8 py-3.5 bg-white font-display font-bold text-sm tracking-widest uppercase rounded-full transition-all duration-300" style={{ color: 'var(--surface)' }}>On Tour</a>
          <a href="#music" className="inline-block px-8 py-3.5 border border-white/25 text-white font-display font-bold text-sm tracking-widest uppercase rounded-full hover:bg-white/10 transition-all duration-300">Écouter</a>
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <div className="animate-pulse" style={{ width: '1px', height: '3rem', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))' }} />
      </div>
    </section>
  );
}

// Variant C: Logo replaces title entirely — big centered logo + subtitle below
export function HeroC() {
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
          Des ondes qui naissent dans un océan binaire pour parfois s&apos;échouer sur vos plages sonores.
        </p>
        <div className="mt-14 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="#tour" className="inline-block px-8 py-3.5 bg-white font-display font-bold text-sm tracking-widest uppercase rounded-full transition-all duration-300" style={{ color: 'var(--surface)' }}>On Tour</a>
          <a href="#music" className="inline-block px-8 py-3.5 border border-white/25 text-white font-display font-bold text-sm tracking-widest uppercase rounded-full hover:bg-white/10 transition-all duration-300">Écouter</a>
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <div className="animate-pulse" style={{ width: '1px', height: '3rem', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))' }} />
      </div>
    </section>
  );
}

// Variant D: Full-bleed tiled/scaled logo as texture, neon-tinted, title overlaid
export function HeroD() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/parvagues/logo.png"
          alt=""
          fill
          className="object-cover opacity-[0.12] select-none pointer-events-none"
          style={{ filter: 'hue-rotate(-20deg) saturate(1.5)' }}
          priority
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, var(--surface) 0%, rgba(10,10,10,0.7) 30%, rgba(10,10,10,0.7) 70%, var(--surface) 100%)' }} />
      </div>

      <div className="relative z-10 text-center px-6 w-full">
        <h1
          className="font-display font-extrabold leading-none tracking-tight"
          style={{ fontSize: 'clamp(2.5rem, 11vw, 9rem)', textShadow: '0 0 80px rgba(217,0,255,0.3), 0 0 160px rgba(217,0,255,0.1)' }}
        >
          ParVagues
        </h1>
        <div className="mx-auto mt-8 mb-8" style={{ width: '6rem', height: '1px', background: 'linear-gradient(to right, transparent, rgba(217,0,255,0.4), transparent)' }} />
        <p className="text-base md:text-lg italic leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          ParVagues, c&apos;est des ondes qui naissent dans un océan binaire pour parfois s&apos;échouer sur vos plages sonores.
        </p>
        <div className="mt-14 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="#tour" className="inline-block px-8 py-3.5 bg-white font-display font-bold text-sm tracking-widest uppercase rounded-full transition-all duration-300" style={{ color: 'var(--surface)' }}>On Tour</a>
          <a href="#music" className="inline-block px-8 py-3.5 border border-white/25 text-white font-display font-bold text-sm tracking-widest uppercase rounded-full hover:bg-white/10 transition-all duration-300">Écouter</a>
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <div className="animate-pulse" style={{ width: '1px', height: '3rem', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))' }} />
      </div>
    </section>
  );
}

// Variant E: Split — logo left half, text right half, horizontal layout
export function HeroE() {
  return (
    <section className="relative h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 25% 50%, rgba(217,0,255,0.05) 0%, transparent 50%)' }} />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center md:justify-end">
          <div className="relative w-64 h-64 md:w-96 md:h-96">
            <Image
              src="/images/parvagues/logo_transparent.png"
              alt="ParVagues"
              fill
              className="object-contain"
              style={{ filter: 'drop-shadow(0 0 50px rgba(217,0,255,0.2))' }}
              priority
            />
          </div>
        </div>
        <div className="text-center md:text-left">
          <h1
            className="font-display font-extrabold leading-none tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)', textShadow: '0 0 80px rgba(217,0,255,0.2)' }}
          >
            ParVagues
          </h1>
          <div className="mt-6 mb-6 mx-auto md:mx-0" style={{ width: '6rem', height: '1px', background: 'linear-gradient(to right, rgba(217,0,255,0.4), transparent)' }} />
          <p className="text-base md:text-lg italic leading-relaxed max-w-md mx-auto md:mx-0" style={{ color: 'var(--text-muted)' }}>
            Des ondes qui naissent dans un océan binaire pour parfois s&apos;échouer sur vos plages sonores.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a href="#tour" className="inline-block px-8 py-3.5 bg-white font-display font-bold text-sm tracking-widest uppercase rounded-full transition-all duration-300" style={{ color: 'var(--surface)' }}>On Tour</a>
            <a href="#music" className="inline-block px-8 py-3.5 border border-white/25 text-white font-display font-bold text-sm tracking-widest uppercase rounded-full hover:bg-white/10 transition-all duration-300">Écouter</a>
          </div>
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <div className="animate-pulse" style={{ width: '1px', height: '3rem', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))' }} />
      </div>
    </section>
  );
}
