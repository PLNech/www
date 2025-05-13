import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaEnvelope } from 'react-icons/fa';
import styles from '@/styles/parvagues.module.css';
import { useRouter } from 'next/router';

// Custom hook to track scroll position
function useScrolledPast(threshold = 100) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > threshold);
    };
    
    // Initial check
    onScroll();
    
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

export default function ParVaguesHeader({ eventName = null, title = null }) {
  const router = useRouter();
  const isHome = router.pathname === '/parvagues';
  const showInHeader = useScrolledPast(300);
  const headerTitle = title || eventName || 'ParVagues';
  
  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-[#d900ff]/20">
      <div className={`${styles.neonGradient} opacity-5`}></div>
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center relative">
        <div className="flex items-center">
          <Link href="/parvagues" className="flex items-center group">
            <div className="h-10 w-auto relative">
              <Image 
                src="/images/parvagues/logo_transparent.png" 
                alt="ParVagues Logo" 
                width={200}
                height={200}
                className="object-contain transition-all duration-300 group-hover:filter group-hover:drop-shadow-[0_0_8px_rgba(217,0,255,0.7)]" 
              />
            </div>
            
            <div className="overflow-hidden ml-2">
              <span 
                className={`text-white font-bold transition-all duration-500 ${
                  showInHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
                }`}
                style={{ 
                  textShadow: '0 0 5px rgba(217, 0, 255, 0.7), 0 0 10px rgba(217, 0, 255, 0.5)',
                  color: 'var(--neon-high)'
                }}
              >
                {headerTitle}
              </span>
            </div>
          </Link>
        </div>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm tracking-wider">
          <Link href="/parvagues#music" className="text-gray-300 hover:text-[#ff3d7b] transition-colors">
            Music
          </Link>
          <Link href="/parvagues#performances" className="text-gray-300 hover:text-[#ff3d7b] transition-colors">
            Performances
          </Link>
          <Link href="/parvagues#about" className="text-gray-300 hover:text-[#ff3d7b] transition-colors">
            About
          </Link>
        </nav>
        
        {/* CTA button */}
        <a 
          href="/book"
          className={`${styles.outlineButton} py-2 px-4 text-sm`}
        >
          <FaEnvelope className="inline mr-2" />
          Book
        </a>
      </div>
    </header>
  );
}