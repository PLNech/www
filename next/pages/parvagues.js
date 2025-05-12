import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { getAllLives } from '@/lib/livesData';
import styles from '@/styles/parvagues.module.css';
import dynamic from 'next/dynamic';
import ParVaguesHeader from '@/components/ParVaguesHeader';
import ParVaguesFooter from '@/components/ParVaguesFooter';
import GlitchText from '@/components/GlitchText';
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

// React Icons imports
import { FaSpotify, FaDeezer, FaYoutube, FaApple, FaAmazon, FaInstagram, FaTwitter, FaEnvelope } from 'react-icons/fa';
import { SiTidal, SiBluesky, SiMastodon } from 'react-icons/si';
import { MdPlayArrow, MdPause } from 'react-icons/md';

function CodeBlock({ children, height = '400px', isTerminal = false }) {
  return (
    <div className={`${styles.codeContainer} ${isTerminal ? styles.terminalContainer : ''}`} style={{ maxHeight: height }}>
      {isTerminal && (
        <div className={styles.terminalHeader}>
          <div className={styles.terminalControls}>
            <span className={styles.redCircle}></span>
            <span className={styles.yellowCircle}></span>
            <span className={styles.greenCircle}></span>
          </div>
          <div className={styles.terminalTitle}>ParVagues@tidal:~</div>
        </div>
      )}
      <SyntaxHighlighter 
        language="haskell"
        style={atomOneDark}
        wrapLongLines={true}
        customStyle={{ 
          margin: 0, 
          borderRadius: isTerminal ? '0 0 8px 8px' : '8px',
          height: 'auto',
          maxHeight: isTerminal ? `calc(${height} - 30px)` : height,
          fontSize: '0.85rem'
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

// Define all posters and their positions
const posterImages = [
  '/images/parvagues/lives/2022/Bazurto/poster.jpg',
  '/images/parvagues/lives/2022/OPERATE/poster.png',
  '/images/parvagues/lives/2024/ccc_release_party/poster.png',
  '/images/parvagues/lives/2025/algorave-lyon/poster.jpeg',
  '/images/parvagues/lives/2025/ensad/poster.png',
];

export default function ParVagues({ lives }) {
  const [tidalCode, setTidalCode] = useState('');
  const [showPlayers, setShowPlayers] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSection, setSelectedSection] = useState('code');
  const [sectionImages, setSectionImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentAlbumIndex, setCurrentAlbumIndex] = useState(0);
  const backgroundRef = useRef(null);
  const audioRef = useRef(null);
  
  // Define section content
  const sections = {
    code: {
      type: 'image',
      image: '/images/parvagues/samples.png'
    },
    midi: {
      type: 'carousel',
      images: [
        '/images/parvagues/studio1.jpg',
        '/images/parvagues/gear1.jpg',
        '/images/parvagues/gear2.jpg'
      ]
    },
    performance: {
      type: 'carousel',
      images: [
        '/images/parvagues/live.jpg',
        '/images/parvagues/code_overlay.jpg'
      ]
    }
  };
  
  // Fetch Tidal code with proxy or fallback
  useEffect(() => {
    // Use fallback code since CORS is blocking
    const code = `do 
setcps (120/60/4) -- 120 BPM
d1 $ "k . k(<3!3 5>,8)" . "jazz" -- Kick chaloupé
d2 $ "~ s ~ s*<1 2>" # "snare:42" -- Snare régulier
d3 $ whenmod 8 6 (degradeBy 0.2)
  $ fast "<1 1 2 <1 2>>" 
  $ "dr*[8 16]" # "h2ogmhh:2" -- Drumroll 
d4 $ note ("<e3 fs3 <gs3 d4> <a3 df4>>" - 12) 
  # "bassWarsaw"  -- BASSLINE`;
    setTidalCode(code);
  }, []);
  
  // Update section images based on selection
  useEffect(() => {
    const sectionContent = sections[selectedSection];
    if (sectionContent && sectionContent.type === 'carousel') {
      setSectionImages(sectionContent.images);
      setCurrentImageIndex(0);
    }
  }, [selectedSection]);
  
  // Carousel effect for section images
  // next/pages/parvagues.js (snippet from useEffect for backgroundRef)
  useEffect(() => {
    if (!backgroundRef.current) return;
    
    const images = backgroundRef.current.children;
    if (images.length === 0) return; // Guard against no images

    let index = 0;
    
    // Initial setup for the very first image
    for (let i = 0; i < images.length; i++) {
      images[i].style.opacity = '0'; // Ensure all are initially transparent
    }
    if (images[index]) {
       images[index].style.opacity = '0.7'; // Make the first one visible
    }
    
    const cycle = () => {
      // Current image fades out
      if (images[index]) {
        images[index].style.opacity = '0';
      }
      
      index = (index + 1) % images.length;
      
      // Next image fades in
      if (images[index]) {
        images[index].style.opacity = '0.7';
      }
    };
    
    // Call cycle once to set the initial state correctly after a brief moment
    // setTimeout(cycle, 100); // Or let the interval handle the first full cycle
    
    const interval = setInterval(cycle, 3000); // Start cycling after 3s
    return () => clearInterval(interval);
  }, []); // Removed sectionImages.length from dependencies as it's not used here

  useEffect(() => {
    if (sectionImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % sectionImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [sectionImages.length]);

  // Carousel effect for albums
  useEffect(() => {
    if (albums.length > 1) {
      const interval = setInterval(() => {
        setCurrentAlbumIndex(prev => (prev + 1) % albums.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const scrollToSection = (e) => {
    e.preventDefault();
    const section = document.getElementById('section1');
    section?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const togglePlayer = (albumId) => {
    setShowPlayers(prev => ({
      ...prev,
      [albumId]: !prev[albumId]
    }));
  };
  
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const albums = [
    {
      id: '2024_opal',
      title: 'Livecoding (Opal Festival 2024)',
      image: '/images/parvagues/albums/2024_opal/cover.jpg',
      links: [
        { platform: 'YouTube', url: 'https://www.youtube.com/playlist?list=OLAK5uy_l4MF3OCIXcdPMpsHGVX2Q9MiX6oU1zT6g', icon: <FaYoutube /> },
        { platform: 'Deezer', url: 'https://www.deezer.com/us/album/656760591', icon: <FaDeezer /> },
        { platform: 'Spotify', url: 'https://open.spotify.com/album/1VKLZWeolFNfES2bWzYCWZ', icon: <FaSpotify /> },
        { platform: 'Apple', url: 'https://music.apple.com/fr/album/livecoding-opal-festival-2024/1773790990', icon: <FaApple /> },
        { platform: 'Tidal', url: 'https://listen.tidal.com/album/393127518', icon: <SiTidal /> },
        { platform: 'Amazon', url: 'https://amazon.com/dp/B0DK298L1X', icon: <FaAmazon /> }
      ]
    },
    {
      id: '2023_connexion',
      title: 'Connexion Etablie EP',
      image: '/images/parvagues/albums/2023_connexion/cover.jpg',
      links: [
        { platform: 'YouTube', url: 'https://www.youtube.com/watch?v=VODSdQKrzyw&list=OLAK5uy_nzlx3b7YJYzrbagXF5swhENsCg5vJkT_Q', icon: <FaYoutube /> },
        { platform: 'Spotify', url: 'https://open.spotify.com/album/4uzSN6Uv9IwcYeHdRtkUmM', icon: <FaSpotify /> },
        { platform: 'Deezer', url: 'https://www.deezer.com/album/498443581', icon: <FaDeezer /> },
        { platform: 'Apple', url: 'https://music.apple.com/fr/album/_/1711226283', icon: <FaApple /> },
        { platform: 'Amazon', url: 'https://music.amazon.com/albums/B0CKTZMFDF', icon: <FaAmazon /> }
      ]
    }
  ];
  
  const renderSectionContent = () => {
    const sectionContent = sections[selectedSection];
    if (!sectionContent) return null;
    
    switch (sectionContent.type) {
      case 'image':
        return (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-xl">
            <Image
              src={sectionContent.image}
              alt={selectedSection}
              fill
              className="object-cover"
            />
          </div>
        );
      case 'carousel':
        return (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-xl group">
            {albums.map((album, index) => (
              <div key={album.id} className="absolute inset-0">
                <Image
                  src={album.image}
                  alt={album.title}
                  fill
                  className={`object-cover transition-all duration-500 group-hover:blur-sm group-hover:opacity-40 ${
                    index === currentAlbumIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                {index === currentAlbumIndex && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <div className="text-white text-center">
                      <h3 className="text-2xl font-bold mb-4">{album.title}</h3>
                      <div className="flex justify-center space-x-4">
                        {album.links.map((link) => (
                          <a 
                            key={link.platform} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-3xl hover:text-purple-400 transition-colors"
                          >
                            {link.icon}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {albums.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentAlbumIndex
                      ? 'bg-purple-400 w-6'
                      : 'bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        );
      case 'code':
        return (
          <CodeBlock height="400px" isTerminal={true}>
            {sectionContent.content || 'Chargement du code...'}
          </CodeBlock>
        );
      default:
        return null;
    }
  };
  
  return (
    <>
      <Head>
        <title>ParVagues - Musique Algorithmique</title>
        <meta name="description" content="Livecoding de musique open-source avec TidalCycles et contrôleur MIDI" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/images/parvagues/favicon.ico" />
      </Head>
      
      <div className="flex flex-col min-h-screen bg-black text-white">
        {/* Apply proper sticky header */}
        <ParVaguesHeader />
        
        {/* Main content flex-auto to push footer to bottom */}
        <main className="flex-auto">
          {/* Hero Section */}
          <section className={`${styles.heroSection} mt-0`}>
            <div className={styles.posterCollage} ref={backgroundRef}>
              {posterImages.map((src, i) => (
                <Image
                  key={i}
                  src={src}
                  alt={`Poster ${i + 1}`}
                  fill
                  className={styles.posterImage}
                  priority={i < 3}
                />
              ))}
            </div>
            
            {/* Audio element */}
            <audio 
              ref={audioRef} 
              src="/parvagues.mp3" 
              loop 
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            <div className={styles.contentOverlay}>
              <div className={styles.heroContent}>
                {/* Left side: Title and content */}
                <div className="md:w-1/2">
                  <h1 className={styles.heroTitle}>
                    <GlitchText 
                      text="ParVagues" 
                      className={styles.glitchEffect} 
                      burstFrequency={4500} 
                    />
                  </h1>
                  <p className={styles.heroSubtitle}>
                    Livecoding de musique open-source avec TidalCycles et contrôleur MIDI
                  </p>
                  <a href="#section1" onClick={scrollToSection} className={styles.plungeButton}>
                    Plonger ↓
                  </a>
                </div>
                
                {/* Right side: Code sample with play overlay */}
                <div className="md:w-1/2 relative">
                  <div className="relative">
                    <CodeBlock className="h-full" isTerminal={true}>
                      {tidalCode}
                    </CodeBlock>
                    
                    {/* Pretty Play overlay */}
                    <button
                      onClick={toggleAudio}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-black/80 group"
                    >
                      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-8 shadow-xl shadow-purple-500/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-purple-500/30">
                        {isPlaying ? (
                          <MdPause className="w-16 h-16 text-white" />
                        ) : (
                          <MdPlayArrow className="w-16 h-16 text-white" />
                        )}
                      </div>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isPlaying ? 'Pause' : 'Écouter le mix'}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Section 1: Interactive Sections */}
          <section id="section1" className={styles.sectionContainer}>
            <div className={styles.splitSection}>
              <div>
                <div 
                  className={`${styles.bulletPoint} cursor-pointer ${selectedSection === 'potentiel' ? 'text-purple-400 border-l-2 border-purple-400 pl-4' : ''}`}
                  onClick={() => setSelectedSection('potentiel')}
                >
                  <h3 className="text-xl font-semibold text-purple-400 mb-2">Potentiel</h3>
                  <p className="text-gray-300">Samples glanés et synthés SuperCollider</p>
                </div>
                
                <div 
                  className={`${styles.bulletPoint} cursor-pointer ${selectedSection === 'composition' ? 'text-purple-400 border-l-2 border-purple-400 pl-4' : ''}`}
                  onClick={() => setSelectedSection('composition')}
                >
                  <h3 className="text-xl font-semibold text-purple-400 mb-2">Composition</h3>
                  <p className="text-gray-300">Code Haskell TidalCycles + input MIDI</p>
                </div>
                
                <div 
                  className={`${styles.bulletPoint} cursor-pointer ${selectedSection === 'performance' ? 'text-purple-400 border-l-2 border-purple-400 pl-4' : ''}`}
                  onClick={() => setSelectedSection('performance')}
                >
                  <h3 className="text-xl font-semibold text-purple-400 mb-2">Performance</h3>
                  <p className="text-gray-300">Performance live avec improvisation au contrôleur MIDI</p>
                </div>
              </div>
              
              <div>
                {renderSectionContent()}
              </div>
            </div>
          </section>
          
          {/* Section 2: Music */}
          <section id="music" className={styles.sectionContainer}>
            <h2 className="text-3xl font-bold mb-8 text-center">
              <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Tracks
              </span>
            </h2>
            <div className={styles.albumGrid}>
              {albums.map(album => (
                <div 
                  key={album.id} 
                  className={`${styles.albumCard} group relative overflow-hidden aspect-square`}
                >
                  <Image
                    src={album.image}
                    alt={album.title}
                    fill
                    className={`${styles.albumImage} object-cover transition-opacity duration-300 group-hover:opacity-50`}
                  />
                  <div className="absolute inset-0 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60">
                    <div className={styles.playerContainer}>
                      {album.links.map(link => (
                        <a
                          key={link.platform}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${styles.playerButton} text-white hover:text-purple-400`}
                        >
                          {link.icon}
                          <span className="ml-2">{link.platform}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                  <h3 className="absolute bottom-0 left-0 right-0 p-2 text-lg font-semibold text-white bg-black/50 text-center group-hover:hidden">
                    {album.title}
                  </h3>
                </div>
              ))}
            </div>
          </section>
          
          {/* Section 3: About */}
          <section id="about" className={`${styles.sectionContainer} pb-24`}>
            <h2 className="text-3xl font-bold mb-8 text-center">
              <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                À propos
              </span>
            </h2>
            <div className="max-w-3xl mx-auto text-gray-300 space-y-4">
              <p>
                ParVagues, c'est des ondes qui naissent dans un océan binaire pour parfois s'échouer sur vos plages sonores.
              </p>
              <p>
                Codé avec TidalCycles, chaque enregistrement est issu d'une structure algorithmique, au code source libre et réutilisable.
              </p>
              <p>
                En particulier, ParVagues existe grâce :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>à <a href="https://tidalcycles.org" className="text-purple-400 hover:text-purple-300">Yaxu</a> et la <a href="https://tidalcycles.org/community" className="text-purple-400 hover:text-purple-300">communauté TidalCycles</a></li>
                <li>à <a href="https://supercollider.github.io" className="text-purple-400 hover:text-purple-300">SuperCollider</a> et les <a href="https://github.com/supercollider/sc3-plugins" className="text-purple-400 hover:text-purple-300">SC3-Plugins</a></li>
                <li>à <a href="https://github.com/musikinformatik/SuperDirt" className="text-purple-400 hover:text-purple-300">SuperDirt</a> et ses samples</li>
                <li>au Santa Clara Laptop Orchestra (<a href="https://www.scu.edu/cas/music/ensembles/sclork/" className="text-purple-400 hover:text-purple-300">www.scu.edu/cas/music/ensembles/sclork/</a>)</li>
                <li>aux projets <a href="https://pickleddiscs.bandcamp.com/album/blood-sport-sample-pack" className="text-purple-400 hover:text-purple-300">BloodSport Samples</a> et <a href="https://hydrogen-music.org/" className="text-purple-400 hover:text-purple-300">Hydrogen</a></li>
              </ul>
              <p>
                Le résultat final est publié sous license CC-BY-SA : <br />
                vous êtes libres de les récupérer, modifier et repartager, tant que vous mentionnez leur origine.
              </p>
              <p>
                Le code source final de chaque partition est disponible sur <a href="https://nech.pl/parvagues" className="text-purple-400 hover:text-purple-300">nech.pl/parvagues</a>.<br/>
                Les enregistrements originaux sont disponibles sur demande.
              </p>
            </div>
          </section>
        </main>
        {/* Footer - not sticky */}
        <ParVaguesFooter />
      </div>
    </>
  );
}

export async function getStaticProps() {
  const lives = getAllLives();
  
  return {
    props: {
      lives,
    },
    revalidate: 60,
  };
}
