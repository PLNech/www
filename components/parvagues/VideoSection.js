import { useState } from 'react';
import { FaPlay, FaYoutube } from 'react-icons/fa';

// source: 'archive' (default) | 'youtube'
// For YouTube: id is the YouTube video ID
// For archive.org: id is the archive identifier
const featuredVideo = {
  id: 'bS5jcIJfU6c',
  source: 'youtube',
  title: 'Algorave GZ25',
  subtitle: 'w/ Pérégrine · Algorave Lyon, European-wide annual event',
  date: 'Fév 2025',
  featured: true,
};

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
    id: 'gpstPH1aa54',
    source: 'youtube',
    title: 'Live Coding @ Algolia',
    subtitle: 'Algolia All Hands · Paris',
    date: 'Oct 2024',
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

function getThumbnail(video) {
  if (video.source === 'youtube') {
    return `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
  }
  return `https://archive.org/services/img/${video.id}`;
}

function getEmbedUrl(video) {
  if (video.source === 'youtube') {
    return `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1`;
  }
  return `https://archive.org/embed/${video.id}`;
}

function getPrivacyLabel(video) {
  if (video.source === 'youtube') return 'YouTube (Google)';
  return 'archive.org';
}

function VideoCard({ video }) {
  const [consent, setConsent] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const isYouTube = video.source === 'youtube';

  // Consent gate for YouTube (privacy)
  if (isYouTube && !consent && !loaded) {
    return (
      <div>
        <button
          onClick={() => { setConsent(true); setLoaded(true); }}
          className="aspect-video w-full rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:ring-1 hover:ring-[var(--neon-high)]/30"
          style={{ position: 'relative', background: 'var(--surface-raised)' }}
        >
          <img
            src={getThumbnail(video)}
            alt={video.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
            className="group-hover:opacity-60 transition-opacity duration-300"
            loading="lazy"
          />
          <div style={{ position: 'absolute', inset: 0 }} className="bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          <div style={{ position: 'absolute', inset: 0 }} className="flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-red-600/20 group-hover:scale-110 group-hover:border-red-500/30 transition-all duration-300">
              <FaYoutube className="w-5 h-5 text-red-500/80 group-hover:text-red-400 transition-colors" />
            </div>
            <span className="text-[10px] text-white/40 tracking-wider">Cliquer pour charger depuis YouTube</span>
          </div>
        </button>
        <div className="mt-3">
          <h4 className="font-display font-semibold text-sm">{video.title}</h4>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{video.subtitle} · {video.date}</p>
        </div>
      </div>
    );
  }

  if (loaded) {
    return (
      <div>
        <div className="aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            src={getEmbedUrl(video)}
            width="100%"
            height="100%"
            allowFullScreen
            allow="autoplay; encrypted-media"
            className="w-full h-full"
          />
        </div>
        <div className="mt-3 flex items-start justify-between">
          <div>
            <h4 className="font-display font-semibold text-sm">{video.title}</h4>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{video.subtitle} · {video.date}</p>
          </div>
          <button
            onClick={() => { setLoaded(false); setConsent(false); }}
            className="text-[11px] text-[var(--text-muted)] hover:text-white transition-colors tracking-wider mt-1"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  // Archive.org — no consent needed (privacy-friendly)
  return (
    <div>
      <button
        onClick={() => setLoaded(true)}
        className="aspect-video w-full rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:ring-1 hover:ring-[var(--neon-high)]/30"
        style={{ position: 'relative', background: 'var(--surface-raised)' }}
      >
        <img
          src={getThumbnail(video)}
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

      {/* Featured video — full width */}
      <div className="mb-12">
        <div className="relative">
          <span className="absolute -top-3 left-4 z-10 px-3 py-0.5 text-[10px] tracking-[0.2em] uppercase font-display font-bold rounded-full bg-[var(--neon-high)] text-white">
            Featured
          </span>
          <VideoCard video={featuredVideo} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-8 md:gap-10">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
      </div>
    </section>
  );
}
