import { useEffect, useState, useRef } from 'react';
import { getAllLives, getLiveData, getLivesImages } from '../../../lib/livesData';
import ImageGallery from '@/components/ImageGallery';
import ParVaguesHeader from '@/components/ParVaguesHeader';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { marked } from 'marked';
import Prism from 'prismjs';
import 'prismjs/components/prism-haskell';
import styles from '@/styles/parvagues.module.css';
import { FaEnvelope, FaYoutube } from 'react-icons/fa';

export default function Live({ data, slug, images }) {
  const [timeToEvent, setTimeToEvent] = useState(null);
  const [currentTeasing, setCurrentTeasing] = useState(null);
  const [pastEvent, setPastEvent] = useState(false);
  const [teasingsToShow, setTeasingsToShow] = useState([]);
  const [posterImage, setPosterImage] = useState(null);
  const [mainColor, setMainColor] = useState('#a855f7');
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
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
  
  // Handle Prism code highlighting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Prism.highlightAll();
    }
  }, [teasingsToShow]);
  
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
  
  // Calculate time to event and set appropriate teasings
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const eventDate = new Date(data.frontmatter.date);
      const timeDiff = eventDate - now;
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
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
    const interval = setInterval(updateCountdown, 1000 * 60 * 60); // Update every hour
    
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
  
  // Scroll to details section
  const scrollToSection = (e) => {
    e.preventDefault();
    const section = document.getElementById('details-section');
    section?.scrollIntoView({ behavior: 'smooth' });
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
  
  return (
    <>
      <Head>
        <title>{data.frontmatter.title} - ParVagues</title>
        <meta name="description" content={data.frontmatter.description} />
      </Head>
      
      {/* Above fold section */}
      <div 
        className="min-h-screen text-white relative overflow-hidden"
        style={{
          background: mainColor ? `radial-gradient(circle at 50% 0%, ${mainColor}20 0%, #000 60%)` : '#000'
        }}
      >
        {/* Background poster image with blur */}
        {posterImage && (
          <div className="absolute inset-0 overflow-hidden z-0">
            <div className="absolute inset-0 w-[120%] h-[120%] -left-[10%] -top-[10%]">
              <Image
                src={posterImage}
                alt={data.frontmatter.title}
                fill
                className="object-cover opacity-40"
                style={{ 
                  filter: 'blur(24px)',
                  transform: 'scale(1.1)',
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90"></div>
          </div>
        )}
        
        {/* Use the ParVaguesHeader component */}
        <ParVaguesHeader isSticky={isHeaderSticky} eventName={data.frontmatter.title} />
        
        {/* Fixed top CTA that shows only when not in sticky mode */}
        <a 
          href="mailto:parvagues@nech.pl?subject=Booking Request&body=Bonjour,%0D%0A%0D%0AJe souhaiterais discuter d'une possibilité de performance live coding."
          className={`${styles.ctaButton} ${isHeaderSticky ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        >
          <FaEnvelope className="inline mr-2" />
          Invoquer un live
        </a>
        
        {/* Main hero content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen pt-16 pb-20">
          <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
            <article className="w-full mx-auto bg-black/80 backdrop-filter backdrop-blur-sm rounded-2xl overflow-hidden border border-purple-500/20 shadow-xl shadow-purple-900/20">
              <div className="grid md:grid-cols-5 gap-0">
                {/* Left column: Title and info (3/5 width) */}
                <div className="md:col-span-3 p-8 md:p-10">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    <span className={`bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent ${styles.glitchEffect}`}>
                      {data.frontmatter.title}
                    </span>
                  </h1>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-200">
                    {data.frontmatter.subtitle || 'Événement ParVagues'}
                  </h2>
                  <div className="text-gray-300 mb-6">
                    <p className="text-xl">{data.frontmatter.location}</p>
                    <p>{formatEventDate(data.frontmatter.date)} {data.frontmatter.time && `• ${data.frontmatter.time}`}</p>
                  </div>
                  
                  {/* Countdown or date display */}
                  {timeToEvent !== null && (
                    <div className="mb-8">
                      {timeToEvent >= 0 ? (
                        <div className="inline-flex items-center bg-black/60 p-4 rounded-lg border border-purple-500/30">
                          <div className="text-3xl font-bold mr-3 text-purple-400">J-{timeToEvent}</div>
                          <div className="text-gray-300">avant l'événement</div>
                        </div>
                      ) : (
                        <div className="inline-flex items-center bg-black/60 p-4 rounded-lg border border-purple-500/30">
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
                        className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/20"
                      >
                        {data.frontmatter.ctaText || "S'inscrire"}
                      </a>
                    )}
                    
                    <a 
                      href="#details-section" 
                      onClick={scrollToSection}
                      className="inline-block bg-black/70 text-white border border-purple-500/30 px-8 py-3 rounded-lg font-semibold hover:bg-black/90 hover:border-purple-500/50 transition-all"
                    >
                      Détails
                    </a>
                  </div>
                </div>
                </div>
            </article>
          </div>
        </div>
        
        {/* Floating tags in background */}
        {data.frontmatter.tags && data.frontmatter.tags.length > 0 && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {data.frontmatter.tags.map((tag, index) => (
              <div 
                key={index}
                className="absolute text-purple-500/20 font-bold text-3xl md:text-6xl uppercase select-none"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 60 - 30}deg)`,
                  opacity: 0.1 + Math.random() * 0.3
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Below fold section */}
      <div id="details-section" className="min-h-screen bg-black text-white relative">
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, #000 0%, ${mainColor}10 50%, #000 100%)`
        }} />
        
        {/* Content */}
        <div className="relative z-10">
          <main className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-16">
            <article className="bg-black/80 backdrop-filter backdrop-blur-sm rounded-2xl overflow-hidden border border-purple-500/20 shadow-xl shadow-purple-900/20 p-6 md:p-10">
              {pastEvent ? (
                // Post-event view
                <div className="space-y-12">
                  {/* Media section */}
                  {(data.frontmatter.video || data.frontmatter.audio) && (
                    <div className="space-y-8">
                      <h2 className="text-3xl font-bold mb-8">
                        <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                          Captures
                        </span>
                      </h2>
                      
                      {data.frontmatter.video && renderYouTubeEmbed(data.frontmatter.video)}
                      {data.frontmatter.audio && renderAudioPlayer(data.frontmatter.audio)}
                    </div>
                  )}
                  
                  {/* Content description */}
                  <div className="prose prose-purple prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={renderMarkdown(data.content)} />
                  </div>
                  
                  {/* Gallery if available */}
                  {images && images.length > 0 && (
                    <div className="mt-12">
                      <h2 className="text-3xl font-bold mb-8">
                        <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                          Gallerie
                        </span>
                      </h2>
                      <ImageGallery images={images} slug={slug} />
                    </div>
                  )}
                  
                  {/* Teasings archive */}
                  {teasingsToShow.length > 0 && (
                    <details className="group mt-12">
                      <summary className="cursor-pointer p-4 bg-black/50 rounded-lg hover:bg-black/70 transition-colors border border-purple-500/10">
                        <span className="font-mono text-purple-400">// decrypt teasings</span>
                      </summary>
                      <div className="mt-4 space-y-4 pl-4 border-l-2 border-purple-500/20">
                        {teasingsToShow.map((teasing, i) => (
                          <div key={i} className="bg-black/40 rounded p-4">
                            <div 
                              className="prose prose-purple prose-invert prose-pre:bg-gray-900/70 prose-pre:border prose-pre:border-purple-500/20 max-w-none text-sm"
                              dangerouslySetInnerHTML={renderMarkdown(teasing)}
                            />
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                // Pre-event view
                <div className="space-y-12">
                  {/* Description */}
                  <div className="prose prose-purple prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={renderMarkdown(data.frontmatter.description)} />
                  </div>
                  
                  {/* Teasings */}
                  {teasingsToShow.length > 0 && (
                    <div className="space-y-8">
                      <h2 className="text-3xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                          Teasings
                        </span>
                      </h2>
                      {teasingsToShow.map((teasing, i) => (
                        <div key={i} className="bg-black/60 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
                          <div 
                            className="prose prose-purple prose-invert prose-pre:bg-gray-900/70 prose-pre:border prose-pre:border-purple-500/20 max-w-none"
                            dangerouslySetInnerHTML={renderMarkdown(teasing)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* CTA button if available */}
                  {data.frontmatter.ctaURL && (
                    <div className="text-center py-8">
                      <a 
                        href={data.frontmatter.ctaURL}
                        className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/20 text-xl"
                      >
                        {data.frontmatter.ctaText || data.frontmatter.title}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </article>
          </main>
          
          {/* Footer */}
          <footer className={styles.footer}>
            <p className="text-gray-400">© {new Date().getFullYear()} ParVagues</p>
            <Link href="/parvagues" className="mt-4 inline-block text-gray-500 text-sm hover:text-purple-400 transition-colors">
              ← Retour à ParVagues
            </Link>
          </footer>
        </div>
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
