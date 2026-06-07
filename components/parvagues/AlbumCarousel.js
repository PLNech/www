import { FaSpotify, FaDeezer, FaYoutube, FaApple, FaBandcamp } from 'react-icons/fa';
import { SiTidal, SiDeezer } from 'react-icons/si';

const albumsData = [
    {
        id: '2024_opal',
        title: 'Livecoding (Opal Festival 2024)',
        image: '/images/parvagues/albums/2024_opal/cover.jpg',
        links: [
            { platform: 'Spotify', url: 'https://open.spotify.com/album/1VKLZWeolFNfES2bWzYCWZ', icon: <FaSpotify /> },
            { platform: 'Bandcamp', url: 'https://parvagues.bandcamp.com/album/livecoding-opal-festival-2024', icon: <FaBandcamp /> },
            { platform: 'YouTube', url: 'https://www.youtube.com/playlist?list=OLAK5uy_l4MF3OCIXcdPMpsHGVX2Q9MiX6oU1zT6g', icon: <FaYoutube /> },
            { platform: 'Apple', url: 'https://music.apple.com/fr/album/livecoding-opal-festival-2024/1773790990', icon: <FaApple /> },
            { platform: 'Deezer', url: 'https://www.deezer.com/fr/album/632734951', icon: <SiDeezer /> },
        ]
    },
    {
        id: '2023_connexion',
        title: 'Connexion Etablie EP',
        image: '/images/parvagues/albums/2023_connexion/cover.jpg',
        links: [
            { platform: 'Spotify', url: 'https://open.spotify.com/album/4uzSN6Uv9IwcYeHdRtkUmM', icon: <FaSpotify /> },
            { platform: 'Bandcamp', url: 'https://parvagues.bandcamp.com/album/connexion-tablie', icon: <FaBandcamp /> },
            { platform: 'YouTube', url: 'https://www.youtube.com/watch?v=VODSdQKrzyw&list=OLAK5uy_nzlx3b7YJYzrbagXF5swhENsCg5vJkT_Q', icon: <FaYoutube /> },
            { platform: 'Apple', url: 'https://music.apple.com/fr/album/_/1711226283', icon: <FaApple /> },
            { platform: 'Deezer', url: 'https://www.deezer.com/fr/album/505854371', icon: <SiDeezer /> },
        ]
    }
];

export default function AlbumCarousel() {
    return (
        <div className="w-full py-24 bg-gradient-to-b from-black via-purple-900/10 to-black">
            <h2 className="text-4xl md:text-6xl font-black text-center mb-16 text-white tracking-tight">
                LATEST RELEASES
            </h2>

            <div className="flex flex-wrap justify-center gap-16 px-4">
                {albumsData.map((album) => (
                    <div key={album.id} className="group relative w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transition-all hover:-translate-y-4">
                        <div className="aspect-square relative overflow-hidden">
                            <img
                                src={album.image}
                                alt={album.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter group-hover:brightness-50"
                            />
                            {/* Overlay with links */}
                            <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-wrap p-4">
                                {album.links.map((link) => (
                                    <a
                                        key={link.platform}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:text-purple-600 hover:scale-110 transition-all shadow-lg"
                                        title={link.platform}
                                    >
                                        <span className="text-2xl">{link.icon}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 text-center bg-gray-900 border-t border-white/5">
                            <h3 className="text-2xl font-bold text-white mb-2">{album.title}</h3>
                            <p className="text-gray-400 text-sm uppercase tracking-widest">Listen Now</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
