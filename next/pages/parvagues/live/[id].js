import { useEffect, useState, useRef } from 'react';
import { getAllLives, getLiveData, getLivesImages } from '../../../lib/livesData';
import ImageGallery from '@/components/ImageGallery';
import ParVaguesHeader from '@/components/ParVaguesHeader';
import ParVaguesFooter from '@/components/ParVaguesFooter';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { marked } from 'marked';
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import styles from '@/styles/parvagues.module.css';
import { FaEnvelope, FaYoutube } from 'react-icons/fa';

export default function Live({ data, slug, images }) {
  const [timeToEvent, setTimeToEvent] = useState(null);
  const [timeString, setTimeString] = useState('');
  const [currentTeasing, setCurrentTeasing] = useState(null);
  const [pastEvent, setPastEvent] = useState(false);
  const [teasingsToShow, setTeasingsToShow] = useState([]);
  const [upcomingDrops, setUpcomingDrops] = useState([]);
  const [posterImage, setPosterImage] = useState(null);
  const [mainColor, setMainColor] = useState('#a855f7');
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
  
  // Find poster or live image for background
  useEffect(() => {
    if (images && images.length > 0) {
      const poster = images.find(img => img.includes('poster.'));
      const liveImage = images.find(img => img.includes('live.'));
      
      if (poster) {
        setPosterImage(poster);
      } else if (liveImage) {
        setPosterImage(liveImage);
      }
      // Could add color extraction here in the future
    }
  }, [images]);
  
  // Fix scroll handling for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight);
    };
    
    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Calculate time to event and set appropriate teasings
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const eventDate = new Date(data.frontmatter.date);
      const timeDiff = eventDate - now;
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      // Format precise time string (HH:MM:SS)
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setTimeString(`${days}j ${hours}h ${minutes}m ${seconds}s`);
      
      if (timeDiff > 0) {
        setTimeToEvent(daysDiff);
        setPastEvent(false);
        
        // Set which teasings to show based on days remaining
        const teasings = [];
        
        if (data.frontmatter.teasing1) teasings.push(data.frontmatter.teasing1);
        
        if (daysDiff <= 14 && data.frontmatter.teasing2) {
          teasings.push(data.frontmatter.teasing2);
        }
        
        if (daysDiff <= 7 && data.frontmatter.teasing3) {
          teasings.push(data.frontmatter.teasing3);
        }
        
        // Always show most recent teasing at the top
        setTeasingsToShow(teasings.reverse());
        
        // Set upcoming drops information
        const drops = [];
        
        if (data.frontmatter.drop1date && new Date(data.frontmatter.drop1date) > now) {
          drops.push({
            date: new Date(data.frontmatter.drop1date),
            name: data.frontmatter.drop1name || "Teasing mysterieux"
          });
        }
        
        if (data.frontmatter.drop2date && new Date(data.frontmatter.drop2date) > now) {
          drops.push({
            date: new Date(data.frontmatter.drop2date),
            name: data.frontmatter.drop2name || "Révélation cryptique"
          });
        }
        
        if (data.frontmatter.drop3date && new Date(data.frontmatter.drop3date) > now) {
          drops.push({
            date: new Date(data.frontmatter.drop3date),
            name: data.frontmatter.drop3name || "Manifestation finale"
          });
        }
        
        setUpcomingDrops(drops);
        
      } else {
        setTimeToEvent(-1);
        setPastEvent(true);
        
        // Show all teasings for past events
        const teasings = [];
        if (data.frontmatter.teasing3) teasings.push(data.frontmatter.teasing3);
        if (data.frontmatter.teasing2) teasings.push(data.frontmatter.teasing2);
        if (data.frontmatter.teasing1) teasings.push(data.frontmatter.teasing1);
        setTeasingsToShow(teasings);
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, [data.frontmatter]);
  
  // Helper function to render markdown
  const renderMarkdown = (content) => {
    if (!content) return { __html: '' };
    const html = marked(content);
    return { __html: html };
  };

  // Helper function to format date for display
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  };
  
  // Format precise date with time (HH:MM:SS)
  const formatPreciseDateTime = (date) => {
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };
  
  // Scroll to details section
  const scrollToSection = (e) => {
    e.preventDefault();
    const section = document.getElementById('details-section');
    section?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Calculate time difference in precise format
  const getTimeDifferenceString = (targetDate) => {
    const now = new Date();
    const timeDiff = targetDate - now;
    
    if (timeDiff <= 0) return "Maintenant";
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    if (days > 0) {
      return `${days}j ${hours}h ${minutes}m ${seconds}s`;
    } else {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
  };
  
  // Render YouTube embed if URL is provided
  const renderYouTubeEmbed = (url) => {
    if (!url) return null;
    
    // Extract YouTube video ID
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/)?.[1];
    
    if (!videoId) return null;
    
    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
        <iframe 
          width="100%" 
          height="100%" 
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen>
        </iframe>
      </div>
    );
  };
  
  // Render audio player if URL is provided
  const renderAudioPlayer = (url) => {
    if (!url) return null;
    
    return (
      <div className="my-6">
        <h3 className="text-xl font-semibold text-purple-400 mb-3">Audio</h3>
        <audio 
          controls 
          className="w-full"
          src={url}>
          Votre navigateur ne supporte pas l'élément audio.
        </audio>
      </div>
    );
  };
  
  // Render code blocks with SyntaxHighlighter
  const renderCodeBlock = (code, language = 'haskell') => {
    return (
      <div className={styles.codeContainer}>
        <SyntaxHighlighter 
          language={language}
          style={atomOneDark}
          wrapLongLines={true}
          customStyle={{ 
            margin: 0, 
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  };
  
  return (
    <>
      <Head>
        <title>{data.frontmatter.title} - ParVagues</title>
        <meta name="description" content={data.frontmatter.description} />
        <link rel="icon" href="/images/parvagues/favicon.ico" />
      </Head>
      
      {/* Above fold section */}
      <div className="flex flex-col min-h-screen text-white relative overflow-hidden">
        {/* Background poster image with blur */}
        {posterImage && (
          <div className={styles.posterBackground}>
            <Image
                src={posterImage}
                alt={data.frontmatter.title}
                fill
                className={styles.posterImageBG}
              />
            <div className={styles.posterGradient}></div>
          </div>
        )}
        
        {/* Neon gradient overlay */}
        <div className={styles.neonGradient}></div>

        {/* Use the ParVaguesHeader component */}
        <ParVaguesHeader eventName={data.frontmatter.title} />
        
        {/* Main content with flex-auto to push footer to bottom */}
        <main className="flex-auto">
          {/* Main hero content */}
          <div className="relative z-10 flex items-center justify-center min-h-screen pt-16 pb-20">
            <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
              <article className="w-full mx-auto bg-black/80 backdrop-filter backdrop-blur-sm rounded-2xl overflow-hidden border border-[#d900ff]/20 shadow-xl shadow-[#d900ff]/20">
                <div className="grid md:grid-cols-5 gap-0">
                  {/* Left column: Title and info (3/5 width) */}
                  <div className="md:col-span-3 p-8 md:p-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                      <span className={`bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent z-10 ${styles.glitchEffect}`}>
                        {data.frontmatter.title}
                      </span>
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-200 z-10">
                      {data.frontmatter.subtitle || 'ParVagues'}
                    </h2>
                    <div className="text-gray-300 mb-6">
                      <p className="text-xl">{data.frontmatter.location}</p>
                      <p>{formatEventDate(data.frontmatter.date)} {data.frontmatter.time && `• ${data.frontmatter.time}`}</p>
                    </div>
                    
                    {/* Countdown or date display */}
                    {timeToEvent !== null && (
                      <div className="mb-8">
                        {timeToEvent >= 0 ? (
                          <div className="inline-flex items-center bg-black/60 p-4 rounded-lg border border-[#d900ff]/30">
                            <div className="font-mono text-2xl font-bold mr-3 text-[#d900ff]">{timeString}</div>
                            <div className="text-gray-300">avant l'événement</div>
                          </div>
                        ) : (
                          <div className="inline-flex items-center bg-black/60 p-4 rounded-lg border border-[#d900ff]/30">
                            <div className="text-gray-300">Événement passé</div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* CTA button and scroll link */}
                    <div className="flex flex-wrap gap-4">
                      {data.frontmatter.ctaURL && !pastEvent && (
                        <a 
                          href={data.frontmatter.ctaURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#8900b3] hover:bg-[#a700d1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d900ff]"
                        >
                          {data.frontmatter.ctaText || 'S\'inscrire'}
                        </a>
                      )}
                      
                      <a 
                        href="#details-section" 
                        onClick={scrollToSection}
                        className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-200 bg-black/40 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        En savoir plus
                      </a>
                    </div>
                  </div>
                  
                  {/* Right column: status and teasers (2/5 width) */}
                  <div className="md:col-span-2 bg-black/80 p-8 md:p-10 border-t md:border-t-0 md:border-l border-[#d900ff]/20">
                    {/* Upcoming drops section */}
                    {upcomingDrops.length > 0 && (
                      <div className="mb-8 bg-black/50 border border-[#d900ff]/30 rounded-lg p-4">
                        <h3 className="text-xl font-bold text-[#d900ff] mb-4">Prochains drops</h3>
                        <div className="space-y-4">
                          {upcomingDrops.map((drop, index) => (
                            <div key={index} className="flex items-center justify-between gap-4 border-b border-[#d900ff]/10 pb-4 last:border-0 last:pb-0">
                              <div>
                                <div className="text-lg font-medium text-gray-200">{drop.name}</div>
                                <div className="text-sm text-gray-400">{formatPreciseDateTime(drop.date)}</div>
                              </div>
                              <div className="font-mono text-lg text-[#ff3d7b]">{getTimeDifferenceString(drop.date)}</div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 text-sm text-center text-gray-400 italic">
                          Reviens à ces moments précis pour ne rien manquer...
                        </div>
                      </div>
                    )}
                    
                    {/* Teasings */}
                    {teasingsToShow.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-[#d900ff] mb-4">Teasings</h3>
                        <div className="space-y-6">
                          {teasingsToShow.map((teasing, index) => (
                            <div key={index} className="bg-black/50 border border-[#d900ff]/30 rounded-lg p-4">
                              <div dangerouslySetInnerHTML={renderMarkdown(teasing)} className="prose prose-sm prose-invert max-w-none" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </div>
          </div>
          
          {/* Details section */}
          <section id="details-section" className={styles.sectionContainer}>
            <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                
                {/* Description */}
                <div>
                  <h2 className="text-2xl font-bold text-[#d900ff] mb-6">À propos de cet événement</h2>
                  <div 
                    className="prose prose-lg prose-invert"
                    dangerouslySetInnerHTML={renderMarkdown(data.content)} 
                  />
                  
                  {/* Media */}
                  {data.frontmatter.youtubeURL && renderYouTubeEmbed(data.frontmatter.youtubeURL)}
                  {data.frontmatter.audioURL && renderAudioPlayer(data.frontmatter.audioURL)}
                </div>
                
                {/* Gallery */}
                <div>
                  {images && images.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-[#d900ff] mb-6">Galerie</h2>
                      <ImageGallery 
                        images={images}
                        slug={slug}
                        alt={data.frontmatter.title}
                        className="filter grayscale hover:grayscale-0"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
        
        {/* Footer */}
        <ParVaguesFooter />
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const lives = getAllLives();
  const paths = lives.map((live) => ({
    params: { id: live.slug },
  }));
  
  return {
    paths,
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const data = await getLiveData(params.id);
  const images = getLivesImages(params.id);
  
  return {
    props: {
      data,
      slug: params.id,
      images,
    },
    revalidate: 60, // Revalidate every minute
  };
}
