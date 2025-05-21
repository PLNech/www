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
  const [selectedSection, setSelectedSection] = useState('potentiel');
  const [sectionImages, setSectionImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentAlbumIndex, setCurrentAlbumIndex] = useState(0);
  const backgroundRef = useRef(null);
  const audioRef = useRef(null);
  
  // Filter future events and sort them by date in ascending order
  const futureEvents = lives.filter(live => {
    return new Date(live.date) > new Date();
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Define section content
  const sections = {
    potentiel: {
      type: 'carousel',
      images: [
        '/images/parvagues/samples_crop.png',
        // '/images/parvagues/code.png',
      ]
    },
    composition: {
      type: 'carousel',
      images: [
        '/images/parvagues/gear1_crop.jpg',
      ]
    },
    performance: {
      type: 'carousel',
      images: [
        // '/images/parvagues/live.jpg',
        '/images/parvagues/hands.jpg'
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

  // Auto-toggling for sections (Potentiel, Composition, Performance)
  const sectionOrder = ['potentiel', 'composition', 'performance'];
  useEffect(() => {
    const intervalId = setInterval(() => {
      setSelectedSection(currentSection => {
        const currentIndex = sectionOrder.indexOf(currentSection);
        const nextIndex = (currentIndex + 1) % sectionOrder.length;
        return sectionOrder[nextIndex];
      });
    }, 5000); // 5 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount or when selectedSection changes
  }, [selectedSection]); // Re-run effect (and reset timer) when selectedSection changes
  
  // Auto-advance carousel for section images
  useEffect(() => {
    if (sections[selectedSection]?.images?.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % sections[selectedSection].images.length);
      }, 2500);
      
      return () => clearInterval(interval);
    }
  }, [selectedSection, sections]);

  // Carousel navigation functions
  const nextSectionImage = () => {
    const imagesArray = sections[selectedSection].images;
    setCurrentImageIndex(prev => (prev + 1) % imagesArray.length);
  };
  
  const prevSectionImage = () => {
    const imagesArray = sections[selectedSection].images;
    setCurrentImageIndex(prev => (prev === 0 ? imagesArray.length - 1 : prev - 1));
  };

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
  
  // Define the desired order of platforms
  const platformOrder = ['YouTube', 'Deezer', 'Spotify', 'Apple', 'Tidal', 'Amazon'];
  
  const albumsData = [
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

  // Sort the links for each album
  const albums = albumsData.map(album => ({
    ...album,
    links: album.links.sort((a, b) => {
      const indexA = platformOrder.indexOf(a.platform);
      const indexB = platformOrder.indexOf(b.platform);
      // If a platform is not in platformOrder, keep its relative order towards the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    })
  }));
  
  const renderSectionContent = () => {
    const sectionContent = sections[selectedSection];
    if (!sectionContent) return null;

    return (
      <div className="w-full flex flex-col items-center">
        {/* Image Frame: 4/3 aspect ratio, max-width 50vw */}
        <div className="w-full max-w-[50vw] aspect-[4/3] bg-black rounded-lg overflow-hidden shadow-xl mb-4">
          <img
            src={sectionContent.images[currentImageIndex]}
            alt={selectedSection}
            className="w-full h-full object-cover"
          />
        </div>
        
        {sectionContent.images.length > 1 && (
          <div className="flex items-center">
            <button 
              onClick={prevSectionImage} 
              className="bg-black/30 hover:bg-black/50 p-2 rounded-full transition-colors mx-2"
              aria-label="Image précédente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={nextSectionImage} 
              className="bg-black/30 hover:bg-black/50 p-2 rounded-full transition-colors mx-2"
              aria-label="Image suivante"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
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
        <ParVaguesHeader />
        
        {/* Main content flex-auto to push footer to bottom */}
        <main className="flex-auto">
          {/* Hero Section */}
          <section className={`${styles.heroSection} mt-0`}>
            <div className={styles.posterCollage} ref={backgroundRef}>
              {posterImages.map((src, i) => (
                <img
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
                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <a href="#section1" onClick={scrollToSection} className={styles.plungeButton}>
                      Plonger ↓
                    </a>
                    {futureEvents.length > 0 && (
                      <Link href="#performances" className={`${styles.outlineButton} group`}>
                        <span>LIVE</span>
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                      </Link>
                    )}
                  </div>
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
                  className={`cursor-pointer transition-all duration-300 hover:bg-purple-500/10 rounded-lg p-2 ${selectedSection === 'potentiel' ? 'text-purple-400 border-l-2 border-purple-400 pl-4' : 'text-gray-400 border-l-2 border-transparent'}`}
                  onClick={() => setSelectedSection('potentiel')}
                >
                  <h3 className={`${styles.bulletPoint} text-xl font-semibold mb-2 group relative inline-block ${selectedSection === 'potentiel' ? 'text-purple-400' : 'text-gray-400'}`} style={{ margin: '1em 0', textDecorationLine: 'underline', textDecorationColor: 'darkviolet', textDecorationThickness: '3px' }}>
                    Potentiel
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                  </h3>
                  <p className={`${selectedSection === 'potentiel' ? 'text-gray-300' : 'text-gray-500'}`}>Samples glanés et synthés SuperCollider</p>
                </div>

                <div
                  className={`cursor-pointer transition-all duration-300 hover:bg-purple-500/10 rounded-lg p-2 ${selectedSection === 'composition' ? 'text-purple-400 border-l-2 border-purple-400 pl-4' : 'text-gray-400 border-l-2 border-transparent'}`}
                  onClick={() => setSelectedSection('composition')}
                >
                  <h3 className={`${styles.bulletPoint} text-xl font-semibold mb-2 group relative inline-block ${selectedSection === 'composition' ? 'text-purple-400' : 'text-gray-400'}`} style={{ margin: '1em 0', textDecorationLine: 'underline', textDecorationColor: 'darkviolet', textDecorationThickness: '3px' }}>
                    Composition
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                  </h3>
                  <p className={`${selectedSection === 'composition' ? 'text-gray-300' : 'text-gray-500'}`}>Code Haskell TidalCycles + input MIDI</p>
                </div>

                <div
                  className={`cursor-pointer transition-all duration-300 hover:bg-purple-500/10 rounded-lg p-2 ${selectedSection === 'performance' ? 'text-purple-400 border-l-2 border-purple-400 pl-4' : 'text-gray-400 border-l-2 border-transparent'}`}
                  onClick={() => setSelectedSection('performance')}
                >
                  <h3 className={`${styles.bulletPoint} text-xl font-semibold mb-2 group relative inline-block ${selectedSection === 'performance' ? 'text-purple-400' : 'text-gray-400'}`} style={{ margin: '1em 0', textDecorationLine: 'underline', textDecorationColor: 'darkviolet', textDecorationThickness: '3px' }}>
                    Performance
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                  </h3>
                  <p className={`${selectedSection === 'performance' ? 'text-gray-300' : 'text-gray-500'}`}>Performance live avec improvisation au contrôleur MIDI</p>
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
                Sorties
              </span>
            </h2>
            <div className="grid grid-cols-2 gap-6 justify-center items-stretch max-w-4xl mx-auto">
            {albums.map(album => (
              <div 
                key={album.id} 
                className="flex justify-center w-xs py-4">
                
                <Image 
                  src={album.image}
                  alt={album.title} 
                  width={480}
                  height={480}
                  className="mx-auto mb-4" 
                />

                
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-lg font-bold text-white mb-3 truncate w-full">{album.title}</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {album.links.map(link => (
                      <a
                        key={link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-black/50 backdrop-blur-sm hover:bg-purple-500/70 text-white rounded-full p-2 transition-all duration-300 hover:shadow-glow"
                        title={link.platform}
                      >
                        <span className="text-xl">{link.icon}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          </section>
          
          {/* Section: Performances */}
          {futureEvents.length > 0 && (
            <section id="performances" className={styles.sectionContainer}>
              <h2 className="text-3xl font-bold mb-8 text-center">
                <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  Prochains Événements
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {futureEvents.slice(0, 3).map(live => (
                  <Link href={`/parvagues/live/${live.slug}`} key={live.slug} legacyBehavior>
                    <a className="block bg-black/30 border border-purple-500/20 rounded-lg overflow-hidden hover:border-purple-500/70 transition-all hover:shadow-glow hover:-translate-y-1">
                      <div className="relative h-40">
                        <img 
                          src={`/images/parvagues/lives/${live.year}/${live.slug}/poster.jpg`}
                          alt={live.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          {new Date(live.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white">{live.title}</h3>
                        <p className="text-purple-300 text-sm mt-1">{live.location}</p>
                        <p className="text-gray-400 text-sm mt-2 line-clamp-2">{live.description}</p>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
              
              {/* TODO: Consider a 'all lives' page */}
              {/* <div className="flex justify-center mt-10">
                <Link href="/parvagues/lives" className={styles.outlineButton}>
                  Voir tous les événements
                </Link>
              </div> */}
            </section>
          )}
          
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
