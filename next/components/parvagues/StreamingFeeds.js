import { useState } from 'react';
import { FaSoundcloud, FaSpotify, FaYoutube, FaInstagram, FaBandcamp } from 'react-icons/fa';
import { SiDeezer } from 'react-icons/si';

export default function StreamingFeeds() {
    const [activeTab, setActiveTab] = useState('soundcloud');
    const [instagramConsent, setInstagramConsent] = useState(false);

    const tabs = [
        { id: 'soundcloud', label: 'SoundCloud', icon: FaSoundcloud, color: 'from-orange-500 to-orange-600' },
        { id: 'spotify', label: 'Spotify', icon: FaSpotify, color: 'from-green-500 to-green-600' },
        { id: 'bandcamp', label: 'Bandcamp', icon: FaBandcamp, color: 'from-cyan-500 to-blue-600' },
        { id: 'youtube', label: 'YouTube', icon: FaYoutube, color: 'from-red-500 to-red-600' },
        { id: 'deezer', label: 'Deezer', icon: SiDeezer, color: 'from-purple-500 to-pink-600' },
        { id: 'instagram', label: 'Instagram', icon: FaInstagram, color: 'from-pink-500 to-purple-600' },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto py-24 px-4">
            <div className="text-center mb-12">
                <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600 mb-4">
                    STREAMING
                </h2>
                <p className="text-gray-400 text-lg">
                    Explore recent sets, tracks, and performances across platforms
                </p>
            </div>

            {/* Tab navigation */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
                {tabs.map(({ id, label, icon: Icon, color }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold transition-all text-sm md:text-base ${activeTab === id
                                ? `bg-gradient-to-r ${color} text-white shadow-lg scale-105`
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                    >
                        <Icon className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                ))}
            </div>

            {/* Content area */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4 md:p-8 min-h-[400px]">
                {activeTab === 'soundcloud' && (
                    <div className="space-y-4">
                        <iframe
                            width="100%"
                            height="450"
                            scrolling="no"
                            frameBorder="no"
                            allow="autoplay"
                            src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/users/1084818893&color=%23a700d1&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
                            className="rounded-xl"
                        />
                        <div className="text-center">
                            <a
                                href="https://soundcloud.com/parvagues"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-full hover:scale-105 transition-transform"
                            >
                                <FaSoundcloud className="w-5 h-5" />
                                View Full Profile
                            </a>
                        </div>
                    </div>
                )}

                {activeTab === 'spotify' && (
                    <div className="space-y-4">
                        <iframe
                            style={{ borderRadius: '12px' }}
                            src="https://open.spotify.com/embed/artist/0kznTQnx5QRhMwktmZboX4?utm_source=generator&theme=0"
                            width="100%"
                            height="450"
                            frameBorder="0"
                            allowFullScreen
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                        />
                        <div className="text-center">
                            <a
                                href="https://open.spotify.com/artist/0kznTQnx5QRhMwktmZboX4"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-full hover:scale-105 transition-transform"
                            >
                                <FaSpotify className="w-5 h-5" />
                                Listen on Spotify
                            </a>
                        </div>
                    </div>
                )}

                {activeTab === 'bandcamp' && (
                    <div className="space-y-4">
                        <iframe
                            style={{ border: 0, width: '100%', height: '450px', borderRadius: '12px' }}
                            src="https://bandcamp.com/EmbeddedPlayer/album=3869867806/size=large/bgcol=333333/linkcol=a700d1/tracklist=false/transparent=true/"
                            seamless
                        />
                        <div className="text-center">
                            <a
                                href="https://parvagues.bandcamp.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full hover:scale-105 transition-transform"
                            >
                                <FaBandcamp className="w-5 h-5" />
                                Visit Bandcamp
                            </a>
                        </div>
                    </div>
                )}

                {activeTab === 'youtube' && (
                    <div className="space-y-4">
                        <div className="aspect-video rounded-xl overflow-hidden">
                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed?listType=user_uploads&list=@parvagues"
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>
                        <div className="text-center">
                            <a
                                href="https://www.youtube.com/@parvagues/videos"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-full hover:scale-105 transition-transform"
                            >
                                <FaYoutube className="w-5 h-5" />
                                Subscribe on YouTube
                            </a>
                        </div>
                    </div>
                )}

                {activeTab === 'deezer' && (
                    <div className="space-y-4">
                        <iframe
                            title="deezer-widget"
                            src="https://widget.deezer.com/widget/dark/artist/103670512/top_tracks"
                            width="100%"
                            height="450"
                            frameBorder="0"
                            allowTransparency
                            allow="encrypted-media; clipboard-write"
                            style={{ borderRadius: '12px' }}
                        />
                        <div className="text-center">
                            <a
                                href="https://www.deezer.com/fr/artist/103670512"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-full hover:scale-105 transition-transform"
                            >
                                <SiDeezer className="w-5 h-5" />
                                Listen on Deezer
                            </a>
                        </div>
                    </div>
                )}

                {activeTab === 'instagram' && (
                    <div className="space-y-4">
                        {!instagramConsent ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <FaInstagram className="w-16 h-16 text-purple-400 mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">Privacy Notice</h3>
                                <p className="text-gray-400 mb-6 max-w-md">
                                    Loading Instagram content will connect to Meta's servers and may track your activity.
                                </p>
                                <button
                                    onClick={() => setInstagramConsent(true)}
                                    className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-full hover:scale-105 transition-transform"
                                >
                                    Load Instagram Feed
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-center py-8">
                                    <p className="text-gray-400 mb-4">
                                        Follow @parvagues.mp3 for behind-the-scenes content and live updates
                                    </p>
                                </div>
                                <div className="text-center">
                                    <a
                                        href="https://www.instagram.com/parvagues.mp3/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-full hover:scale-105 transition-transform"
                                    >
                                        <FaInstagram className="w-5 h-5" />
                                        Follow on Instagram
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
