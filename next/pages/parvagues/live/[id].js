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
    }
  }, [images]);
  
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
        
        if (daysDiff <= 2 && data.frontmatter.teasing3) {
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
    
    if (days > 0) {
      return `${days}j ${hours}h ${minutes}m`;
    } else {
      return `${hours}h ${minutes}m`;
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
      <div className="my-4">
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Audio</h3>
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
            fontSize: '0.85rem',
            maxHeight: '200px' // Limit height
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
        <meta name="description" content={data.frontmatter.description || `ParVagues live: ${data.frontmatter.title}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/images/parvagues/favicon.ico" />
      </Head>
      
      <div className="flex flex-col min-h-screen bg-black text-white">
        {/* Header with event title */}
        <ParVaguesHeader title={data.frontmatter.title} />
        
        <main className="flex-auto">
          {/* Hero Section - More compact */}
          <section className="relative min-h-[60vh] md:min-h-[50vh] flex items-center overflow-hidden">
            {/* FIXME: Rewrite the Background Image with gradient overlay */}
            {/* {posterImage && (
              <div className="z-0">
                <img
                  src={posterImage}
                  alt={data.frontmatter.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black"></div>
              </div>
            )} */}
            
            <div className="container mx-auto px-4 py-8 relative z-10">
              <div className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  {/* Left Side: Event Info */}
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">{data.frontmatter.title}</h1>
                    
                    {pastEvent ? (
                      <div className="inline-block bg-gray-800 text-white text-sm px-3 py-1 rounded-full mb-4">
                        Événement passé
                      </div>
                    ) : (
                      <div className="inline-block bg-purple-800 text-white text-sm px-3 py-1 rounded-full mb-4">
                        {timeToEvent === 0 ? "Aujourd'hui" : `Dans ${timeString}`}
                      </div>
                    )}
                    
                    <div className="flex flex-col space-y-2 mb-4">
                      <div className="flex items-center">
                        <span className="text-purple-400 w-24">Date:</span>
                        <span>{formatEventDate(data.frontmatter.date)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="text-purple-400 w-24">Lieu:</span>
                        <span>{data.frontmatter.venue || 'À annoncer'}</span>
                      </div>
                      
                      {data.frontmatter.city && (
                        <div className="flex items-center">
                          <span className="text-purple-400 w-24">Ville:</span>
                          <span>{data.frontmatter.city}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {data.frontmatter.ticketLink && !pastEvent && (
                        <a 
                          href={data.frontmatter.ticketLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-md text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                        >
                          Billets
                        </a>
                      )}
                      
                      {data.frontmatter.eventLink && (
                        <a 
                          href={data.frontmatter.eventLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md text-white font-medium transition-all"
                        >
                          Info Event
                        </a>
                      )}
                      
                      <a 
                        href="#details-section" 
                        onClick={scrollToSection}
                        className="bg-transparent border border-purple-500 hover:bg-purple-900/30 px-4 py-2 rounded-md text-white font-medium transition-all"
                      >
                        Détails
                      </a>
                    </div>
                  </div>
                  
                  {/* Right Side: Upcoming Drops or Latest Teasing */}
                  <div>
                    {!pastEvent && upcomingDrops.length > 0 ? (
                      <div className="bg-black/60 backdrop-blur p-4 rounded-lg border border-purple-500/30">
                        <h3 className="text-lg font-semibold text-purple-400 mb-3">Prochains drops</h3>
                        <ul className="space-y-2">
                          {upcomingDrops.map((drop, i) => (
                            <li key={i} className="flex items-center justify-between bg-black/50 p-2 rounded">
                              <span className="text-sm">{drop.name}</span>
                              <span className="text-xs bg-purple-900/60 px-2 py-1 rounded">
                                {getTimeDifferenceString(drop.date)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : teasingsToShow.length > 0 ? (
                      <div className="bg-black/60 backdrop-blur p-4 rounded-lg border border-purple-500/30">
                        <h3 className="text-lg font-semibold text-purple-400 mb-2">
                          {pastEvent ? "Highlights" : "Teasing"}
                        </h3>
                        <div dangerouslySetInnerHTML={renderMarkdown(teasingsToShow[0])} className="prose prose-sm prose-invert max-w-none" />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Details Section - More compact */}
          <section id="details-section" className="bg-black py-8">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-6">
                {/* Main Content */}
                <div className="md:col-span-8">
                  {/* Main Content */}
                  <div className="bg-gray-900/40 rounded-lg p-4 mb-4">
                    <h2 className="text-xl font-bold mb-3 text-purple-400">À propos</h2>
                    <div 
                      dangerouslySetInnerHTML={renderMarkdown(data.content)} 
                      className="prose prose-sm prose-invert max-w-none"
                    />
                  </div>
                  
                  {/* Media */}
                  {data.frontmatter.youtubeUrl && (
                    <div className="mb-4">
                      {renderYouTubeEmbed(data.frontmatter.youtubeUrl)}
                    </div>
                  )}
                  
                  {data.frontmatter.audioUrl && renderAudioPlayer(data.frontmatter.audioUrl)}
                  
                  {/* Code Sample */}
                  {data.frontmatter.codeSnippet && (
                    <div className="bg-gray-900/40 rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-semibold text-purple-400 mb-2">Code Snippet</h3>
                      {renderCodeBlock(data.frontmatter.codeSnippet)}
                    </div>
                  )}
                </div>
                
                {/* Sidebar */}
                <div className="md:col-span-4">
                  {/* More Teasings */}
                  {teasingsToShow.length > 1 && (
                    <div className="bg-gray-900/40 rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-semibold text-purple-400 mb-2">Plus de teasings</h3>
                      <div className="space-y-3">
                        {teasingsToShow.slice(1).map((teasing, i) => (
                          <div 
                            key={i} 
                            className="bg-black/60 p-3 rounded"
                          >
                            <div 
                              dangerouslySetInnerHTML={renderMarkdown(teasing)} 
                              className="prose prose-xs prose-invert max-w-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Artists */}
                  {data.frontmatter.artists && (
                    <div className="bg-gray-900/40 rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-semibold text-purple-400 mb-2">Artistes</h3>
                      <div 
                        dangerouslySetInnerHTML={renderMarkdown(data.frontmatter.artists)} 
                        className="prose prose-sm prose-invert max-w-none"
                      />
                    </div>
                  )}
                  
                  {/* Mini Gallery - Limited to 3 images */}
                  {images && images.length > 0 && (
                    <div className="bg-gray-900/40 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-purple-400 mb-2">Photos</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {images.slice(0, 3).map((image, i) => (
                          <div key={i} className="relative aspect-square rounded overflow-hidden">
                            <img
                              src={image}
                              alt={`${data.frontmatter.title} - image ${i+1}`}
                              fill
                              className="live-gallery-image object-cover hover:scale-110 transition-transform duration-300 max-w-sm"
                            />
                          </div>
                        ))}
                      </div>
                      {images.length > 3 && (
                        <div className="mt-2 text-center">
                          <button 
                            onClick={() => {
                              const gallery = document.getElementById('full-gallery');
                              gallery?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-xs text-purple-400 hover:text-purple-300"
                          >
                            Voir les {images.length} photos →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Full Gallery - only if more than 3 images */}
              {images && images.length > 3 && (
                <div id="full-gallery" className="max-w-5xl mx-auto mt-8">
                  <ImageGallery images={images} slug={slug} />
                </div>
              )}
            </div>
          </section>
        </main>
        
        <ParVaguesFooter />
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const lives = getAllLives();
  const paths = lives.map(live => ({
    params: { id: live.slug }
  }));
  
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  try {
    const liveData = await getLiveData(params.id);
    const images = await getLivesImages(params.id);
    
    return {
      props: {
        data: liveData,
        slug: params.id,
        images,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error(`Error getting data for ${params.id}:`, error);
    return {
      notFound: true,
    };
  }
}
