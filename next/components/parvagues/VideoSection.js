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
        className="aspect-video w-full bg-white/[0.03] border border-white/[0.06] rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.12]"
      >
        <div className="w-14 h-14 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-[var(--neon-high)]/15 group-hover:scale-110 transition-all duration-300">
          <FaPlay className="w-4 h-4 text-white/60 group-hover:text-white ml-0.5 transition-colors" />
        </div>
        <span className="text-[11px] text-[var(--text-muted)] tracking-wider group-hover:text-white/60 transition-colors">
          archive.org
        </span>
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
    <section id="video" className="max-w-5xl mx-auto px-6 py-24 md:py-32">
      <h2 className="font-display text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase">
        Video
      </h2>
      <div className="h-px bg-white/10 mt-4 mb-12" />

      <div className="grid sm:grid-cols-2 gap-8 md:gap-10">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </section>
  );
}
