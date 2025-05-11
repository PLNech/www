import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaEnvelope } from 'react-icons/fa';
import styles from '@/styles/parvagues.module.css';

export default function ParVaguesHeader({ eventName = null }) {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-black/90 to-black/70 backdrop-blur-md transition-all duration-300 border-b border-purple-500/20 shadow-lg"
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/parvagues" className="text-purple-400 hover:text-purple-300 transition-colors">
            ParVagues
          </Link>
          {eventName && (
            <>
              <span className="text-gray-500 mx-2">|</span>
              <span className="text-white">{eventName}</span>
            </>
          )}
        </div>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6 text-sm">
          <Link href="/parvagues#music" className="text-white hover:text-purple-300 transition-colors">
            Music
          </Link>
          <Link href="/parvagues#performances" className="text-white hover:text-purple-300 transition-colors">
            Performances
          </Link>
          <Link href="/parvagues#about" className="text-white hover:text-purple-300 transition-colors">
            About
          </Link>
        </div>
        
        {/* CTA button */}
        <a 
          href="mailto:parvagues@nech.pl?subject=Booking Request&body=Bonjour,%0D%0A%0D%0AJe souhaiterais discuter d'une possibilité de performance live coding."
          className={`${styles.ctaButton} transition-all duration-300 ${scrolled ? 'bg-purple-600 scale-90' : ''}`}
        >
          <FaEnvelope className="inline mr-2" />
          {scrolled ? 'Invoquer' : 'Invoquer un live'}
        </a>
      </div>
    </header>
  );
} 