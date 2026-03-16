import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { getAllLives, getLiveData, getLivesImages, getLiveTracks } from '@/lib/livesData';
import Layout from '@/components/parvagues/Layout';
import Countdown from '@/components/parvagues/Countdown';
import ImageGallery from '@/components/parvagues/ImageGallery';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import BpmCurve from '@/components/parvagues/BpmCurve';
import Prism from 'prismjs';
import 'prismjs/components/prism-haskell';
import 'prismjs/themes/prism-tomorrow.css';

function TrackIngredient({ ingredient }) {
    return (
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full border border-[var(--neon-high)]/20 text-[var(--neon-high)]">
                    {ingredient.type}
                </span>
            </div>
            <code className="block text-xs text-[var(--text-muted)] font-mono leading-relaxed mb-1 overflow-x-auto">
                {ingredient.code}
            </code>
            <p className="text-[11px] text-[var(--text-muted)]">{ingredient.description}</p>
        </div>
    );
}

function TracksSection({ tracks }) {
    if (!tracks) return null;

    return (
        <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
                <h2 className="font-display text-2xl font-bold text-white">
                    <span className="text-[var(--neon-high)]">#</span> Tracks
                </h2>
                <div className="h-px bg-[var(--neon-high)]/20 flex-grow" />
            </div>

            {tracks.styleDistribution && (
                <div className="flex flex-wrap gap-2 mb-8">
                    {Object.entries(tracks.styleDistribution).map(([style, count]) => (
                        <span key={style} className="px-3 py-1 text-[11px] tracking-widest uppercase rounded-full border border-white/10 text-[var(--text-muted)]">
                            {style} ×{count}
                        </span>
                    ))}
                    {tracks.bpmRange && (
                        <span className="px-3 py-1 text-[11px] tracking-widest uppercase rounded-full border border-[var(--neon-high)]/20 text-[var(--neon-high)]">
                            {tracks.bpmRange[0]}–{tracks.bpmRange[1]} BPM
                        </span>
                    )}
                </div>
            )}

            <div className="space-y-6">
                {tracks.tracks.map((track, i) => (
                    <details key={track.name} className="group bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                        <summary className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.03] transition-colors">
                            <span className="font-mono text-xs text-[var(--text-muted)] w-6">{String(i + 1).padStart(2, '0')}</span>
                            <span className="font-display font-semibold text-sm flex-grow">{track.name}</span>
                            {track.bpm && <span className="text-[11px] text-[var(--text-muted)] font-mono">{track.bpm} BPM</span>}
                            {track.style && <span className="text-[10px] tracking-wider uppercase text-[var(--text-muted)]">{track.style}</span>}
                        </summary>
                        <div className="px-5 pb-5 pt-2 space-y-3 border-t border-white/[0.04]">
                            {track.ingredients.map((ing, j) => (
                                <TrackIngredient key={j} ingredient={ing} />
                            ))}
                            {track.file && (
                                <p className="text-[10px] text-[var(--text-muted)] font-mono mt-2">
                                    src: {track.file}
                                </p>
                            )}
                        </div>
                    </details>
                ))}
            </div>
        </div>
    );
}

function MediaSection({ audio, video, archive }) {
    const links = [
        audio && { url: audio, label: detectPlatform(audio) },
        video && { url: video, label: detectPlatform(video) },
        archive && { url: archive, label: detectPlatform(archive) },
    ].filter(Boolean);

    if (links.length === 0) return null;

    // Try to build an inline embed for the first available source
    const embedSrc = getEmbedUrl(audio || video || archive);

    return (
        <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
                <h2 className="font-display text-2xl font-bold text-white">
                    <span className="text-[var(--neon-high)]">▶</span> Écouter
                </h2>
                <div className="h-px bg-[var(--neon-high)]/20 flex-grow" />
            </div>
            {embedSrc && (
                <div className="mb-6 rounded-xl overflow-hidden border border-white/[0.06]">
                    <iframe
                        src={embedSrc}
                        width="100%"
                        height={embedSrc.includes('youtube') ? 315 : 166}
                        className={embedSrc.includes('youtube') ? 'aspect-video w-full' : ''}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        loading="lazy"
                        style={{ border: 0 }}
                    />
                </div>
            )}
            <div className="flex flex-wrap gap-3">
                {links.map(({ url, label }) => (
                    <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-display font-semibold tracking-wider rounded-full border border-white/10 text-[var(--text-muted)] hover:text-white hover:border-[var(--neon-high)]/40 transition-all duration-200"
                    >
                        {label} →
                    </a>
                ))}
            </div>
        </div>
    );
}

function detectPlatform(url) {
    if (!url) return 'Lien';
    if (url.includes('bandcamp')) return 'Bandcamp';
    if (url.includes('soundcloud')) return 'SoundCloud';
    if (url.includes('youtube')) return 'YouTube';
    if (url.includes('archive.org')) return 'Archive.org';
    if (url.includes('spotify')) return 'Spotify';
    return 'Écouter';
}

function getEmbedUrl(url) {
    if (!url) return null;
    if (url.includes('soundcloud.com/')) {
        return `https://w.soundcloud.com/player/?visual=true&url=${encodeURIComponent(url)}&color=%23a700d1&auto_play=false&show_artwork=true`;
    }
    if (url.includes('archive.org/details/')) {
        const id = url.split('/details/')[1]?.split(/[?#]/)[0];
        return `https://archive.org/embed/${id}`;
    }
    // Bandcamp embeds need numeric IDs — link-only fallback
    return null;
}

export default function LiveEvent({ live, images, tracks, isPostEvent: initialPostEvent }) {
    const [phase, setPhase] = useState(initialPostEvent ? 'post' : 'early');
    const isPostEvent = initialPostEvent;

    useEffect(() => {
        Prism.highlightAll();
    }, [live, phase]);

    const fm = live.frontmatter;
    const eventDate = new Date((fm.date || '') + 'T00:00:00');
    const dateStr = isNaN(eventDate.getTime()) ? null : format(eventDate, 'dd MMMM yyyy', { locale: fr });
    const hasMedia = fm.audio || fm.video || fm.archive;
    const title = fm.title || live.slug;
    const location = fm.location || '';

    return (
        <Layout title={`${title} - ParVagues`}>
            <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
                {/* Header */}
                <div className="text-center mb-12">
                    {dateStr && (
                        <div className="inline-block px-3 py-1 mb-4 text-xs font-mono text-[var(--neon-high)] border border-[var(--neon-high)]/30 rounded-full">
                            {dateStr}
                        </div>
                    )}
                    <h1 className="font-display text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
                        {title}
                    </h1>
                    {location && (
                        <p className="text-lg text-[var(--text-muted)] flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-[var(--neon-high)] rounded-full" style={{ opacity: isPostEvent ? 0.4 : 1, animation: isPostEvent ? 'none' : 'pulse 2s infinite' }} />
                            {location}
                        </p>
                    )}
                </div>

                {/* Poster */}
                {fm.poster && (
                    <div className="mb-12 rounded-2xl overflow-hidden border border-white/[0.06]">
                        <Image
                            src={fm.poster}
                            alt={`${title} poster`}
                            width={1200}
                            height={1710}
                            className="w-full h-auto"
                            priority
                        />
                    </div>
                )}

                {/* Countdown for future events */}
                {!isPostEvent && (
                    <div className="text-center mb-12">
                        <div className="inline-block p-6 bg-black/50 backdrop-blur-md rounded-xl border border-[var(--neon-high)]/30 shadow-[0_0_30px_rgba(137,0,179,0.2)]">
                            <h3 className="text-[var(--neon-high)] mb-4 font-mono text-sm">&gt; INITIALIZING_EVENT</h3>
                            <Countdown targetDate={fm.date} onPhaseChange={setPhase} />
                        </div>
                    </div>
                )}

                {/* Audio/Video Recording */}
                {hasMedia && (
                    <MediaSection
                        audio={fm.audio}
                        video={fm.video}
                        archive={fm.archive}
                    />
                )}

                {/* Main Content */}
                {live.content && live.content.trim() && (
                    <div className="prose prose-invert prose-purple max-w-none mb-16 bg-black/30 p-8 rounded-2xl border border-white/5">
                        <ReactMarkdown>{live.content}</ReactMarkdown>
                    </div>
                )}

                {/* BPM Curve */}
                <BpmCurve tracks={tracks} />

                {/* Tracks & Code */}
                <TracksSection tracks={tracks} />

                {/* Gallery */}
                {images && images.length > 0 && (
                    <div className="mb-16">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="font-display text-2xl font-bold text-white">
                                <span className="text-[var(--neon-high)]">#</span> Galerie
                            </h2>
                            <div className="h-px bg-[var(--neon-high)]/20 flex-grow" />
                        </div>
                        <ImageGallery images={images} />
                    </div>
                )}
            </div>
        </Layout>
    );
}

export async function getStaticPaths() {
    const lives = getAllLives();
    const paths = lives.map((live) => ({
        params: { slug: live.slug },
    }));

    return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
    const live = await getLiveData(params.slug);
    const images = getLivesImages(params.slug);
    const tracks = getLiveTracks(params.slug);

    const isPostEvent = new Date() > new Date((live.frontmatter?.date || '2099-01-01') + 'T23:59:59');

    return {
        props: {
            live,
            images,
            tracks,
            isPostEvent,
        },
        revalidate: 60,
    };
}
