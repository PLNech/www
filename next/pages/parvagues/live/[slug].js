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

export default function LiveEvent({ live, images, tracks }) {
    const [phase, setPhase] = useState('early'); // early, J-14, J-7, J-3, live, post
    const [isPostEvent, setIsPostEvent] = useState(false);

    useEffect(() => {
        // Highlight code blocks
        Prism.highlightAll();
    }, [live, phase]);

    useEffect(() => {
        const checkDate = () => {
            const now = new Date();
            const eventDate = new Date(live.date);
            if (now > eventDate) {
                setIsPostEvent(true);
                setPhase('post');
            }
        };

        checkDate();
        const interval = setInterval(checkDate, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [live.date]);

    // Determine which content to show based on phase
    const getTeasingContent = () => {
        if (isPostEvent) return null;

        // Logic to select teasing content from frontmatter based on phase
        // Assuming frontmatter has fields like teasing_j7, teasing_j3 etc.
        // For now, we'll just show the main description + countdown
        return (
            <div className="text-center mb-12">
                <div className="inline-block p-6 bg-black/50 backdrop-blur-md rounded-xl border border-purple-500/30 shadow-[0_0_30px_rgba(137,0,179,0.2)]">
                    <h3 className="text-purple-400 mb-4 font-mono text-sm">&gt; INITIALIZING_EVENT</h3>
                    <Countdown targetDate={live.date} onPhaseChange={setPhase} />
                </div>
            </div>
        );
    };

    return (
        <Layout title={`${live.title} - ParVagues`}>
            <div className="max-w-4xl mx-auto">
                {/* Header Info */}
                <div className="text-center mb-16">
                    <div className="inline-block px-3 py-1 mb-4 text-xs font-mono text-purple-300 border border-purple-500/30 rounded-full">
                        {(() => {
                            const date = new Date(live.date);
                            return isNaN(date.getTime()) ? 'Date TBD' : format(date, 'dd MMMM yyyy', { locale: fr });
                        })()}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        {live.title}
                    </h1>
                    <p className="text-xl text-gray-400 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                        {live.location}
                    </p>
                </div>

                {/* Poster */}
                {live.frontmatter.poster && (
                    <div className="mb-16 rounded-2xl overflow-hidden border border-white/[0.06]">
                        <Image
                            src={live.frontmatter.poster}
                            alt={`${live.title} poster`}
                            width={1200}
                            height={1710}
                            className="w-full h-auto"
                            priority
                        />
                    </div>
                )}

                {/* Countdown / Teasing */}
                {!isPostEvent && getTeasingContent()}

                {/* Main Content */}
                <div className="prose prose-invert prose-purple max-w-none mb-16 bg-black/30 p-8 rounded-2xl border border-white/5">
                    <ReactMarkdown>{live.content}</ReactMarkdown>
                </div>

                {/* Tracks & Code */}
                <TracksSection tracks={tracks} />

                {/* Gallery (Post-event or if images exist) */}
                {images && images.length > 0 && (
                    <div className="mb-16">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-2xl font-bold text-white">
                                <span className="text-purple-500">#</span> Galerie
                            </h2>
                            <div className="h-px bg-purple-500/30 flex-grow"></div>
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

    return {
        props: {
            live,
            images,
            tracks,
        },
        revalidate: 60,
    };
}
