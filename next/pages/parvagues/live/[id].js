import { useEffect, useState } from 'react';
import { getAllLives, getLiveData, getLivesImages } from '../../../lib/livesData';
import ImageGallery from '../../../components/ImageGallery';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { marked } from 'marked';
import Prism from 'prismjs';
import 'prismjs/components/prism-haskell';
import styles from '../../../styles/parvagues.module.css';

export default function Live({ data, slug, images }) {
  const [timeToEvent, setTimeToEvent] = useState(null);
  const [currentTeasing, setCurrentTeasing] = useState(null);
  const [posterImage, setPosterImage] = useState(null);
  const [mainColor, setMainColor] = useState('#a855f7');
  
  // Find poster image
  useEffect(() => {
    if (images && images.length > 0) {
      const poster = images.find(img => img.includes('poster.'));
      if (poster) {
        setPosterImage(poster);
        // Here you could use a color extraction library like 'color-thief' to get dominant color
        // For now, using default purple
      }
    }
  }, [images]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Prism.highlightAll();
    }
  }, [currentTeasing]);
  
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const eventDate = new Date(data.frontmatter.date);
      const timeDiff = eventDate - now;
      
      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        setTimeToEvent(days);
        
        // Set appropriate teasing based on days remaining
        if (days > 7) {
          setCurrentTeasing(data.frontmatter.teasing1);
        } else if (days > 3) {
          setCurrentTeasing(data.frontmatter.teasing2);
        } else {
          setCurrentTeasing(data.frontmatter.teasing3);
        }
      } else {
        setTimeToEvent(-1); // Event has passed
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000 * 60 * 60); // Update every hour
    
    return () => clearInterval(interval);
  }, [data.frontmatter.date]);
  
  const renderMarkdown = (content) => {
    if (!content) return { __html: '' };
    const html = marked(content);
    return { __html: html };
  };
  
  return (
    <>
      <Head>
        <title>{data.frontmatter.title} - ParVagues</title>
        <meta name="description" content={data.frontmatter.description} />
      </Head>
      
      <div 
        className="min-h-screen text-white relative overflow-hidden"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${mainColor}20 0%, #000 60%)`
        }}
      >
        {/* Gradient overlay */}
        <div className="fixed inset-0" style={{
          background: `linear-gradient(135deg, #000 0%, ${mainColor}10 50%, #000 100%)`
        }} />
        
        <div className="relative z-10">
          <nav className="sticky top-0 bg-black/60 backdrop-blur-md border-b border-purple-500/20">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <Link href="/parvagues" className="text-purple-400 hover:text-purple-300 transition-colors">
                ← ParVagues
              </Link>
            </div>
          </nav>
          
          <main className="max-w-6xl mx-auto px-4 py-8">
            {/* Visible Poster Section */}
            {posterImage && (
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-xl shadow-purple-500/20">
                  <Image
                    src={posterImage}
                    alt={data.frontmatter.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-2">
                <span className={`bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent ${styles.glitchEffect}`}>
                  {data.frontmatter.title}
                </span>
              </h1>
              <p className="text-gray-400">{data.frontmatter.location} • {data.frontmatter.date}</p>
              {data.frontmatter.time && (
                <p className="text-gray-500 text-sm">{data.frontmatter.time}</p>
              )}
            </div>
            
            {timeToEvent !== null && timeToEvent >= 0 ? (
              // Pre-event view
              <div className="space-y-8">
                <div className="text-center">
                  <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-lg shadow-lg shadow-purple-500/20">
                    <div className="text-6xl font-mono mb-2">{timeToEvent}</div>
                    <div className="text-gray-200">jours restants</div>
                  </div>
                </div>
                
                <div className="prose prose-purple prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={renderMarkdown(data.frontmatter.description)} />
                </div>
                
                {currentTeasing && (
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
                    <div 
                      className="prose prose-purple prose-invert prose-pre:bg-gray-900/50 prose-pre:border prose-pre:border-purple-500/20 max-w-none"
                      dangerouslySetInnerHTML={renderMarkdown(currentTeasing)}
                    />
                  </div>
                )}
                
                {data.frontmatter.ctaURL && (
                  <div className="text-center">
                    <a 
                      href={data.frontmatter.ctaURL}
                      className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/20"
                    >
                      {data.frontmatter.ctaText || data.frontmatter.title}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              // Post-event view
              <div className="space-y-8">
                <div className="prose prose-purple prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={renderMarkdown(data.content)} />
                </div>
                
                {(data.frontmatter.video || data.frontmatter.audio) && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {data.frontmatter.video && (
                      <a href={data.frontmatter.video} className="block bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20 hover:border-purple-400 transition-colors">
                        <h3 className="text-xl font-semibold mb-2">📹 Vidéo</h3>
                        <p className="text-gray-400">Regarder la session</p>
                      </a>
                    )}
                    {data.frontmatter.audio && (
                      <a href={data.frontmatter.audio} className="block bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20 hover:border-purple-400 transition-colors">
                        <h3 className="text-xl font-semibold mb-2">🎵 Audio</h3>
                        <p className="text-gray-400">Écouter l'enregistrement</p>
                      </a>
                    )}
                  </div>
                )}
                
                {images && images.length > 0 && (
                  <ImageGallery images={images} slug={slug} />
                )}
                
                <details className="group">
                  <summary className="cursor-pointer p-4 bg-black/30 rounded-lg hover:bg-black/50 transition-colors border border-purple-500/10">
                    <span className="font-mono text-purple-400">// decrypt teasings</span>
                  </summary>
                  <div className="mt-4 space-y-4 pl-4 border-l-2 border-purple-500/20">
                    {[data.frontmatter.teasing1, data.frontmatter.teasing2, data.frontmatter.teasing3].map((teasing, i) => 
                      teasing && (
                        <div key={i} className="bg-black/20 rounded p-4">
                          <div 
                            className="prose prose-purple prose-invert prose-pre:bg-gray-900/50 prose-pre:border prose-pre:border-purple-500/20 max-w-none text-sm"
                            dangerouslySetInnerHTML={renderMarkdown(teasing)}
                          />
                        </div>
                      )
                    )}
                  </div>
                </details>
              </div>
            )}
          </main>
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
