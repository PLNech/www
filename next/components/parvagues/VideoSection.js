import { useState } from 'react';
import { FaPlay } from 'react-icons/fa';

const videos = [
  {
    id: 'toplap-fromscratch-dec2025-parvagues',
    title: 'From Scratch: Jungle 🐅',
    subtitle: 'TOPLAP Stream · Orléans',
    date: 'Déc 2025',
  },
  {
    id: 'toplap-solstice-dec2024-parvagues-',
    title: 'Solstice Stream',
    subtitle: 'TOPLAP · Les Carroz (Alps)',
    date: 'Déc 2024',
  },
  {
    id: 'toplap20-parvagues---z0rg',
    title: '20 Years (w/ z0rg)',
    subtitle: 'TOPLAP · Grand Paris',
    date: 'Fév 2024',
  },
  {
    id: 'latesolstice2023-parvagues',
    title: 'Solstice Stream',
    subtitle: 'TOPLAP · Grand Paris',
    date: 'Déc 2023',
  },
];

function VideoCard({ video }) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <div>
        <div className="aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            src={`https://archive.org/embed/${video.id}`}
            width="100%"
            height="100%"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        <div className="mt-3 flex items-start justify-between">
          <div>
            <h4 className="font-display font-semibold text-sm">{video.title}</h4>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{video.subtitle} · {video.date}</p>
          </div>
          <button
            onClick={() => setLoaded(false)}
            className="text-[11px] text-[var(--text-muted)] hover:text-white transition-colors tracking-wider mt-1"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setLoaded(true)}
        className="aspect-video w-full rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:ring-1 hover:ring-[var(--neon-high)]/30"
        style={{ position: 'relative', background: 'var(--surface-raised)' }}
      >
        {/* Thumbnail from archive.org */}
        <img
          src={`https://archive.org/services/img/${video.id}`}
          alt={video.title}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
          className="group-hover:opacity-80 transition-opacity duration-300"
          loading="lazy"
        />
        <div style={{ position: 'absolute', inset: 0 }} className="bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div style={{ position: 'absolute', inset: 0 }} className="flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-[var(--neon-high)]/20 group-hover:scale-110 group-hover:border-[var(--neon-high)]/30 transition-all duration-300">
            <FaPlay className="w-4 h-4 text-white/80 group-hover:text-white ml-0.5 transition-colors" />
          </div>
        </div>
      </button>
      <div className="mt-3">
        <h4 className="font-display font-semibold text-sm">{video.title}</h4>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{video.subtitle} · {video.date}</p>
      </div>
    </div>
  );
}

export default function VideoSection() {
  return (
    <section id="video" className="reveal section-alt py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-6">
      <h2 className="font-display text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase">
        Video
      </h2>
      <div className="h-px bg-white/10 mt-4 mb-12" />

      <div className="grid sm:grid-cols-2 gap-8 md:gap-10">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
      </div>
    </section>
  );
}
