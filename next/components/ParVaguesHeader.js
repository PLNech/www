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
    <header 
      className="sticky top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-[#d900ff]/20 shadow-lg transition-all duration-300"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/parvagues" className="flex items-center">
            <div className="h-10 w-auto relative">
              <Image 
                src="/images/parvagues/logo_transparent.png" 
                alt="ParVagues Logo" 
                width={40}
                height={40}
                className="object-contain" 
              />
            </div>
            
            {/* Title animation based on scroll */}
            <div className="overflow-hidden ml-2">
              <span 
                className={`text-[#d900ff] text-xl font-bold transform transition-all duration-500 ${
                  showInHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
                }`}
              >
                {headerTitle}
              </span>
            </div>
          </Link>
        </div>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6 text-sm">
          <Link href="/parvagues#music" className="text-white hover:text-[#ff3d7b] transition-colors">
            Music
          </Link>
          <Link href="/parvagues#performances" className="text-white hover:text-[#ff3d7b] transition-colors">
            Performances
          </Link>
          <Link href="/parvagues#about" className="text-white hover:text-[#ff3d7b] transition-colors">
            About
          </Link>
        </div>
        
        {/* CTA button */}
        <a 
          href="mailto:parvagues@nech.pl?subject=Booking Request&body=Bonjour,%0D%0A%0D%0AJe souhaiterais discuter d'une possibilité de performance live coding."
          className={`${styles.ctaButton} ${showInHeader ? 'scale-90' : 'scale-100'} transition-transform duration-300`}
        >
          <FaEnvelope className="inline mr-2" />
          {showInHeader ? 'Invoquer' : 'Invoquer un live'}
        </a>
      </div>
    </header>
  );
} 