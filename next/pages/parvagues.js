import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { getAllLives } from '@/lib/livesData';
import styles from '@/styles/parvagues.module.css';
import dynamic from 'next/dynamic';
import ParVaguesHeader from '@/components/ParVaguesHeader';

// React Icons imports
import { FaSpotify, FaDeezer, FaYoutube, FaApple, FaAmazon, FaInstagram, FaTwitter, FaEnvelope } from 'react-icons/fa';
import { SiTidal, SiBluesky, SiMastodon } from 'react-icons/si';
import { MdPlayArrow, MdPause } from 'react-icons/md';

// Dynamically import Prism.js with no SSR
const Prism = dynamic(() => import('prismjs'), { ssr: false });
const PrismHaskell = dynamic(() => import('prismjs/components/prism-haskell'), { ssr: false });

function CodeBlock({ children, height = '400px', isTerminal = false }) {
  const [isClient, setIsClient] = useState(false);
  const codeRef = useRef(null);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient && codeRef.current) {
      import('prismjs').then((Prism) => {
        Prism.default.highlightElement(codeRef.current);
      });
    }
  }, [isClient, children]);
  
  if (!isClient) {
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
        <pre className="language-haskell">
          <code>{children}</code>
        </pre>
      </div>
    );
  }
  
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
      <pre className="language-haskell">
        <code ref={codeRef}>{children}</code>
      </pre>
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
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const backgroundRef = useRef(null);
  const audioRef = useRef(null);
  
  // Define section content
  const sections = {
    potentiel: {
      type: 'image',
      image: '/images/parvagues/samples.png'
    },
    composition: {
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
    },
    code: {
      type: 'code',
      content: tidalCode
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
  useEffect(() => {
    if (sectionImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % sectionImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [sectionImages.length]);
  
  // Animate background images
  useEffect(() => {
    if (!backgroundRef.current) return;
    
    const images = backgroundRef.current.children;
    let index = 0;
    
    const cycle = () => {
      for (let i = 0; i < images.length; i++) {
        if (i === index) {
          images[i].style.opacity = '0.7';
          images[i].style.transition = 'opacity 0.5s ease';
        } else {
          images[i].style.opacity = '0';
        }
      }
      index = (index + 1) % images.length;
    };
    
    const interval = setInterval(cycle, 3000);
    return () => clearInterval(interval);
  }, []);
  
  // Fix scroll handling for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const threshold = window.innerHeight * 0.7; // Lower threshold to 70% of viewport height
      setIsHeaderSticky(scrollPosition > threshold);
    };
    
    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
  
  const socialLinks = [
    { icon: <FaEnvelope />, label: 'email', url: 'mailto:parvagues@nech.pl' },
    { icon: <SiMastodon />, label: 'mastodon', url: 'https://chaos.social/@PixelNoir' },
    { icon: <FaTwitter />, label: 'twitter', url: 'https://x.com/ParVagues' },
    { icon: <SiBluesky />, label: 'bluesky [soon]', url: '#' },
    { icon: <FaInstagram />, label: 'instagram', url: 'https://instagram.com/parvagues.mp3' }
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
      </Head>
      
      <div className="min-h-screen bg-black text-white relative">
        {/* Replace static CTA with ParVaguesHeader component */}
        <ParVaguesHeader isSticky={isHeaderSticky} />
        
        {/* Fixed top CTA that shows only when not in sticky mode */}
        <a 
          href="mailto:parvagues@nech.pl?subject=Booking Request&body=Bonjour,%0D%0A%0D%0AJe souhaiterais discuter d'une possibilité de performance live coding."
          className={`${styles.ctaButton} ${isHeaderSticky ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        >
          <FaEnvelope className="inline mr-2" />
          Invoquer un live
        </a>
        
        {/* Hero Section */}
        <section className={styles.heroSection}>
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
                <h1 className={`${styles.heroTitle} ${styles.glitchEffect}`}>
                  ParVagues
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
                  <CodeBlock height="300px" isTerminal={true}>
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
                className={`${styles.bulletPoint} cursor-pointer ${selectedSection === 'potentiel' ? 'text-purple-400' : ''}`}
                onClick={() => setSelectedSection('potentiel')}
              >
                <h3 className="text-xl font-semibold text-purple-400 mb-2">Potentiel</h3>
                <p className="text-gray-300">Samples et synthés SuperCollider pour une palette sonore infinie</p>
              </div>
              
              <div 
                className={`${styles.bulletPoint} cursor-pointer ${selectedSection === 'composition' ? 'text-purple-400' : ''}`}
                onClick={() => setSelectedSection('composition')}
              >
                <h3 className="text-xl font-semibold text-purple-400 mb-2">Composition</h3>
                <p className="text-gray-300">Code Haskell TidalCycles pour des patterns algorithmiques complexes</p>
              </div>
              
              <div 
                className={`${styles.bulletPoint} cursor-pointer ${selectedSection === 'performance' ? 'text-purple-400' : ''}`}
                onClick={() => setSelectedSection('performance')}
              >
                <h3 className="text-xl font-semibold text-purple-400 mb-2">Performance</h3>
                <p className="text-gray-300">Live improvise avec contrôleur MIDI pour une interactivité totale</p>
              </div>
            </div>
            
            <div>
              <div className="mb-4 flex gap-4">
                <button
                  onClick={() => setSelectedSection('code')}
                  className={`px-4 py-2 rounded-md transition-all ${
                    selectedSection === 'code'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Code
                </button>
                <button
                  onClick={() => setSelectedSection('potentiel')}
                  className={`px-4 py-2 rounded-md transition-all ${
                    selectedSection === 'potentiel'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Samples
                </button>
              </div>
              {renderSectionContent()}
            </div>
          </div>
        </section>
        
        {/* Section 2: Find me */}
        <section className={styles.sectionContainer}>
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
