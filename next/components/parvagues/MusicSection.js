import { useState } from 'react';
import Image from 'next/image';
import {
  FaBandcamp, FaSpotify, FaYoutube, FaApple, FaSoundcloud, FaInstagram,
} from 'react-icons/fa';

// react-icons doesn't ship a Deezer icon in this version
function DeezerIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.81 4.16v3.03H24V4.16h-5.19zM6.27 8.38v3.027h5.19V8.38H6.27zm12.54 0v3.027H24V8.38h-5.19zM6.27 12.594v3.027h5.19v-3.027H6.27zm6.27 0v3.027h5.19v-3.027h-5.19zm6.27 0v3.027H24v-3.027h-5.19zM0 16.81v3.029h5.19v-3.03H0zm6.27 0v3.029h5.19v-3.03H6.27zm6.27 0v3.029h5.19v-3.03h-5.19zm6.27 0v3.029H24v-3.03h-5.19z"/>
    </svg>
  );
}

const albums = [
  {
    id: '2025_cosmicfest',
    title: 'Live @ CosmicFest',
    image: '/images/parvagues/albums/2025_cosmicfest/cover.jpg',
    links: [
      { platform: 'Bandcamp', url: 'https://parvagues.bandcamp.com/album/live-cosmicfest' },
    ],
  },
  {
    id: '2025_ton_numero',
    title: 'Ton Numéro',
    image: '/images/parvagues/albums/2025_ton_numero/cover.jpg',
    links: [
      { platform: 'Bandcamp', url: 'https://parvagues.bandcamp.com/track/ton-num-ro' },
    ],
  },
  {
    id: '2024_opal',
    title: 'Livecoding (Opal Festival 2024)',
    image: '/images/parvagues/albums/2024_opal/cover.jpg',
    links: [
      { platform: 'Bandcamp', url: 'https://parvagues.bandcamp.com/album/livecoding-opal-festival-2024' },
      { platform: 'Deezer', url: 'https://www.deezer.com/fr/album/632734951' },
      { platform: 'Apple Music', url: 'https://music.apple.com/fr/album/livecoding-opal-festival-2024/1773790990' },
      { platform: 'Spotify', url: 'https://open.spotify.com/album/1VKLZWeolFNfES2bWzYCWZ' },
      { platform: 'YouTube', url: 'https://www.youtube.com/playlist?list=OLAK5uy_l4MF3OCIXcdPMpsHGVX2Q9MiX6oU1zT6g' },
    ],
  },
  {
    id: '2023_connexion',
    title: 'Connexion Établie EP',
    image: '/images/parvagues/albums/2023_connexion/cover.jpg',
    links: [
      { platform: 'Bandcamp', url: 'https://parvagues.bandcamp.com/album/connexion-tablie' },
      { platform: 'Deezer', url: 'https://www.deezer.com/fr/album/505854371' },
      { platform: 'Apple Music', url: 'https://music.apple.com/fr/album/_/1711226283' },
      { platform: 'Spotify', url: 'https://open.spotify.com/album/4uzSN6Uv9IwcYeHdRtkUmM' },
      { platform: 'YouTube', url: 'https://www.youtube.com/watch?v=VODSdQKrzyw&list=OLAK5uy_nzlx3b7YJYzrbagXF5swhENsCg5vJkT_Q' },
    ],
  },
];

const streamingPlatforms = [
  {
    id: 'soundcloud',
    label: 'SoundCloud',
    icon: FaSoundcloud,
    color: '#ff5500',
    embedUrl: 'https://w.soundcloud.com/player/?visual=true&url=https%3A%2F%2Fapi.soundcloud.com%2Fusers%2F788076298&color=%23a700d1&auto_play=false&show_artwork=true&show_user=true&show_reposts=false&show_teaser=true',
    embedHeight: 450,
    profileUrl: 'https://soundcloud.com/parvagues',
  },
  {
    id: 'bandcamp',
    label: 'Bandcamp',
    icon: FaBandcamp,
    color: '#1da0c3',
    embedUrl: 'https://bandcamp.com/EmbeddedPlayer/album=644862623/size=large/bgcol=0a0a0a/linkcol=a700d1/tracklist=false/artwork=small/transparent=true/',
    embedHeight: 450,
    profileUrl: 'https://parvagues.bandcamp.com/',
  },
  {
    id: 'spotify',
    label: 'Spotify',
    icon: FaSpotify,
    color: '#1db954',
    embedUrl: 'https://open.spotify.com/embed/artist/0kznTQnx5QRhMwktmZboX4?utm_source=generator&theme=0',
    embedHeight: 450,
    profileUrl: 'https://open.spotify.com/artist/0kznTQnx5QRhMwktmZboX4',
    isPrivacy: true,
    privacyProvider: 'Spotify',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: FaYoutube,
    color: '#ff0000',
    embedUrl: 'https://www.youtube-nocookie.com/embed/BIG8iGRHCOg?list=OLAK5uy_l4MF3OCIXcdPMpsHGVX2Q9MiX6oU1zT6g',
    embedHeight: 400,
    profileUrl: 'https://www.youtube.com/@parvagues/videos',
    isVideo: true,
    isPrivacy: true,
    privacyProvider: 'YouTube (Google)',
  },
  {
    id: 'deezer',
    label: 'Deezer',
    icon: DeezerIcon,
    color: '#a238ff',
    embedUrl: 'https://widget.deezer.com/widget/dark/artist/103670512/top_tracks',
    embedHeight: 450,
    profileUrl: 'https://www.deezer.com/fr/artist/103670512',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: FaInstagram,
    color: '#e4405f',
    profileUrl: 'https://www.instagram.com/parvagues.mp3/',
    isPrivacy: true,
  },
];

function AlbumCard({ album }) {
  return (
    <div className="group">
      <div
        className="relative rounded-xl overflow-hidden mb-5"
        style={{ aspectRatio: '1', backgroundColor: 'var(--surface-raised)' }}
      >
        <Image
          src={album.image}
          alt={album.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <h4 className="font-display font-semibold text-base mb-3">{album.title}</h4>
      <div className="flex flex-wrap gap-2">
        {album.links.map((link) => (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-[var(--text-muted)] border border-white/[0.08] rounded-full hover:text-white hover:border-[var(--neon-high)]/40 hover:bg-[var(--neon-high)]/5 transition-all duration-200 tracking-wide"
          >
            {link.platform}
          </a>
        ))}
      </div>
    </div>
  );
}

function StreamingEmbed({ platform, onClose }) {
  const [consent, setConsent] = useState(false);
  const Icon = platform.icon;
  const providerName = platform.privacyProvider || platform.label;

  // Privacy-only platforms (no embed, just redirect)
  if (platform.isPrivacy && !platform.embedUrl) {
    return (
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-12 text-center">
        <Icon className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-4" />
        <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm mx-auto">
          Le contenu {providerName} se connecte à des serveurs tiers et peut suivre votre activité.
        </p>
        <a
          href={platform.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-display font-semibold tracking-wider rounded-full border border-white/20 hover:bg-white hover:text-[var(--surface)] transition-all duration-300"
        >
          Voir sur {platform.label} →
        </a>
      </div>
    );
  }

  // Privacy consent gate (has embed but needs user approval)
  if (platform.isPrivacy && !consent) {
    return (
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-12 text-center">
        <Icon className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-4" />
        <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm mx-auto">
          Le contenu {providerName} se connecte à des serveurs tiers et peut suivre votre activité.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setConsent(true)}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-display font-semibold tracking-wider rounded-full border border-white/20 hover:bg-white hover:text-[var(--surface)] transition-all duration-300"
          >
            Charger le lecteur
          </button>
          <a
            href={platform.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-display tracking-wider rounded-full text-[var(--text-muted)] hover:text-white transition-all duration-300"
          >
            Voir sur {platform.label} →
          </a>
        </div>
      </div>
    );
  }

  // Embed loaded (either no privacy gate, or consent given)
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
      <div style={{ height: platform.isVideo ? undefined : platform.embedHeight }}>
        <iframe
          src={platform.embedUrl}
          width="100%"
          height={platform.isVideo ? undefined : platform.embedHeight}
          className={platform.isVideo ? 'aspect-video w-full' : ''}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ borderRadius: '12px' }}
        />
      </div>
      <div className="px-6 py-4 flex items-center justify-between border-t border-white/[0.06]">
        <a
          href={platform.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--text-muted)] hover:text-white transition-colors tracking-wider"
        >
          Voir le profil complet →
        </a>
        <button
          onClick={onClose}
          className="text-xs text-[var(--text-muted)] hover:text-white transition-colors tracking-wider"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

export default function MusicSection() {
  const [activeEmbed, setActiveEmbed] = useState(null);

  const toggle = (id) => setActiveEmbed(activeEmbed === id ? null : id);
  const activePlatform = streamingPlatforms.find((p) => p.id === activeEmbed);

  return (
    <section id="music" className="reveal py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-6">
      {/* Releases */}
      <h2 className="font-display text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase">
        Releases
      </h2>
      <div className="h-px bg-white/10 mt-4 mb-12" />

      <div className="grid md:grid-cols-2 gap-10 md:gap-12 mb-16">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>

      {/* Streaming */}
      <h3 className="font-display text-xl md:text-2xl font-bold tracking-[0.15em] uppercase">
        Streaming
      </h3>
      <div className="h-px bg-white/10 mt-4 mb-8" />

      <div className="flex flex-wrap gap-3 mb-8">
        {streamingPlatforms.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => toggle(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-display font-semibold tracking-wider transition-all duration-300 ${
              activeEmbed === id
                ? 'text-white shadow-lg scale-105'
                : 'bg-white/[0.04] text-[var(--text-muted)] hover:bg-white/[0.08] hover:text-white'
            }`}
            style={
              activeEmbed === id
                ? { backgroundColor: color, boxShadow: `0 0 20px ${color}30` }
                : {}
            }
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {activePlatform && (
        <div className="mt-2 animate-[fadeIn_0.3s_ease-out]">
          <StreamingEmbed
            platform={activePlatform}
            onClose={() => setActiveEmbed(null)}
          />
        </div>
      )}
      </div>
    </section>
  );
}
