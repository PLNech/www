import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FaSoundcloud, FaSpotify, FaYoutube, FaTwitch } from 'react-icons/fa';

// Generate consistent gradient based on string hash
function generateGradient(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 60) % 360;

    return `linear-gradient(135deg, hsl(${hue1}, 70%, 25%) 0%, hsl(${hue2}, 60%, 15%) 100%)`;
}

// Platform badge component
function PlatformBadge({ url, icon: Icon, label }) {
    if (!url) return null;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs transition-all"
            onClick={(e) => e.stopPropagation()}
        >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{label}</span>
        </a>
    );
}

export default function LiveList({ lives }) {
    const sortedLives = [...lives].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="w-full max-w-7xl mx-auto py-24 px-4">
            <div className="flex items-end justify-between mb-16 border-b border-white/10 pb-4">
                <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600">
                    LIVE SETS
                </h2>
                <span className="text-purple-400 font-mono text-sm hidden md:block">
                    // {sortedLives.length} performances
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {sortedLives.map((live) => {
                    const date = new Date(live.date);
                    const isFuture = date > new Date();
                    const isValid = !isNaN(date.getTime());
                    const gradient = generateGradient(live.slug || live.title);

                    return (
                        <Link href={`/parvagues/live/${live.slug}`} key={live.slug}>
                            <div className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                                {/* Background gradient */}
                                <div
                                    className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity"
                                    style={{ background: gradient }}
                                />

                                {/* Noise texture overlay */}
                                <div className="absolute inset-0 opacity-5 mix-blend-overlay" style={{
                                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")'
                                }} />

                                {/* Content */}
                                <div className="relative p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                                    {/* Date badge */}
                                    <div className="flex-shrink-0">
                                        <div className={`px-4 py-2 rounded-xl font-mono font-bold text-sm ${isFuture
                                                ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50'
                                                : 'bg-white/10 text-gray-300 border border-white/20'
                                            }`}>
                                            {isValid ? format(date, 'dd MMM yyyy', { locale: fr }) : 'TBD'}
                                        </div>
                                        {isFuture && (
                                            <div className="mt-2 px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-widest rounded text-center">
                                                Upcoming
                                            </div>
                                        )}
                                    </div>

                                    {/* Event info */}
                                    <div className="flex-grow min-w-0">
                                        <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-purple-300 transition-colors mb-1 truncate">
                                            {live.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm md:text-base group-hover:text-gray-300 transition-colors">
                                            📍 {live.location}
                                        </p>

                                        {/* Platform badges */}
                                        {(live.audio || live.video || live.ctaURL) && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {live.audio && live.audio.includes('soundcloud') && (
                                                    <PlatformBadge url={live.audio} icon={FaSoundcloud} label="SoundCloud" />
                                                )}
                                                {live.audio && live.audio.includes('spotify') && (
                                                    <PlatformBadge url={live.audio} icon={FaSpotify} label="Spotify" />
                                                )}
                                                {live.video && live.video.includes('youtube') && (
                                                    <PlatformBadge url={live.video} icon={FaYoutube} label="YouTube" />
                                                )}
                                                {live.video && live.video.includes('twitch') && (
                                                    <PlatformBadge url={live.video} icon={FaTwitch} label="Twitch" />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Arrow CTA */}
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center group-hover:bg-purple-500 group-hover:border-purple-500 transition-all transform group-hover:rotate-45 group-hover:scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
