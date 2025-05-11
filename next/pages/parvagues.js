import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { getAllLives } from '../lib/livesData';
import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-haskell';
import 'prismjs/themes/prism-tomorrow.css';

export default function ParVagues({ lives }) {
  const rainRef = useRef(null);
  
  useEffect(() => {
    // Highlight code blocks
    Prism.highlightAll();
    
    // Subtle rain effect
    const canvas = rainRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const drops = [];
    for (let i = 0; i < 50; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 20 + 10,
        opacity: Math.random() * 0.5,
        speed: Math.random() * 3 + 2,
      });
    }
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drops.forEach(drop => {
        ctx.strokeStyle = `rgba(147, 51, 234, ${drop.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();
        
        drop.y += drop.speed;
        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const upcomingLives = lives.filter(live => new Date(live.date) > new Date());
  const pastLives = lives.filter(live => new Date(live.date) <= new Date());
  
  return (
    <>
      <Head>
        <title>ParVagues - Live Algorithmic Music</title>
        <meta name="description" content="Live coding performances, algorithmic music, and cyberpunk aesthetics" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white overflow-hidden relative">
        <canvas 
          ref={rainRef}
          className="fixed inset-0 pointer-events-none opacity-40"
          style={{ mixBlendMode: 'screen' }}
        />
        
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="min-h-screen flex flex-col justify-center px-4 relative">
            <div className="max-w-6xl mx-auto w-full">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="md:w-2/3 mb-8 md:mb-0">
                  <h1 className="text-5xl md:text-7xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                      ParVagues
                    </span>
                  </h1>
                  <p className="text-xl text-gray-300 mb-8 font-mono">
                    live.coding() breakbeat.nujazz.hybrid()
                  </p>
                  <div className="grid gap-4">
                    <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto border border-purple-500/20">
                      <code className="language-haskell">{`d1 $ every 4 (0.25 <~) 
   $ fast 2 $ sound "cp ho:3 mt lt"
d8 $ chop 16 $ loopAt 2 
   $ sound "jungle_breaks:45"`}</code>
                    </pre>
                  </div>
                </div>
                
                {/* Live Events Sidebar */}
                <div className="md:w-1/3 md:pl-8">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
                    <h2 className="text-xl font-semibold mb-4 text-purple-400">// upcoming</h2>
                    {upcomingLives.length > 0 ? (
                      <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                        {upcomingLives.map(live => (
                          <Link key={live.slug} href={`/parvagues/live/${live.slug}`}>
                            <div className="cursor-pointer bg-gray-900/50 p-4 rounded hover:bg-gray-900/70 transition-colors">
                              <h3 className="font-semibold text-purple-300">{live.title}</h3>
                              <p className="text-sm text-gray-400">{live.date}</p>
                              <p className="text-xs text-gray-500">{live.location}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No upcoming events</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Code Samples Section */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">
                <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  Live Coding Samples
                </span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold mb-3 text-purple-400">Breakbeat Deconstruction</h3>
                  <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                    <code className="language-haskell">{`d8 $ n (cat[
    0, 0, 0, [0,7],
    0, [0,3], 0, [7,0],
    0, 0, 7, [7,3],
    [7,0], 0, [3,0], 7
  ])
  # s "jungle_breaks"
  # cut 8
  # amp (range 0.7 1.2 rand)`}</code>
                  </pre>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold mb-3 text-purple-400">Nujazz Harmonies</h3>
                  <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                    <code className="language-haskell">{`d4 $ every 8 (|+ n "<12 19>")
  $ off 0.125 (|+ n 7)
  $ chord "<am9 dm9 bm7b5 e7b9>"
  # s "nujazz_keys"
  # lpf (sine * 1000 + 1200)
  # amp 0.8`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </section>
          
          {/* Visual Showcase */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">
                <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  Visual Universe
                </span>
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/20 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-400 text-sm">
                      [live_coding_screenshot.png]
                    </div>
                  </div>
                </div>
                
                <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/20 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-400 text-sm">
                      [live_performance_setup.jpg]
                    </div>
                  </div>
                </div>
                
                <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/20 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-400 text-sm">
                      [cyberpunk_visuals.gif]
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Past Performances */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">
                <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  Archives
                </span>
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {pastLives.slice(0, 6).map(live => (
                  <Link key={live.slug} href={`/parvagues/live/${live.slug}`}>
                    <div className="cursor-pointer bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20 hover:border-purple-400 transition-all transform hover:scale-105">
                      <h3 className="font-semibold mb-2">{live.title}</h3>
                      <p className="text-sm text-gray-400 mb-1">{live.date}</p>
                      <p className="text-xs text-gray-500">{live.location}</p>
                    </div>
                  </Link>
                ))}
              </div>
              
              {pastLives.length > 6 && (
                <div className="text-center mt-8">
                  <button className="text-purple-400 hover:text-purple-300 transition-colors">
                    // show more archives
                  </button>
                </div>
              )}
            </div>
          </section>
          
          {/* Footer */}
          <footer className="py-8 px-4 border-t border-purple-500/20 bg-black/50">
            <div className="max-w-6xl mx-auto text-center">
              <p className="text-gray-400 text-sm">
                © 2025 ParVagues | Algorithmic music & cyberpunk aesthetics
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <a href="https://soundcloud.com/parvagues" className="text-gray-400 hover:text-purple-400 transition-colors">
                  SoundCloud
                </a>
                <a href="https://bandcamp.com/parvagues" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Bandcamp
                </a>
                <a href="https://instagram.com/parvagues" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Instagram
                </a>
              </div>
            </div>
          </footer>
        </div>
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
    revalidate: 60, // Revalidate every minute
  };
}
