import React from 'react';
import Link from 'next/link';
import { FaEnvelope } from 'react-icons/fa';
import styles from '@/styles/parvagues.module.css';

export default function ParVaguesHeader({ isSticky, eventName = null }) {
  return (
    <header 
      className={`${
        isSticky 
          ? 'fixed top-0 bg-black/90 backdrop-blur-md border-b border-purple-500/20 shadow-lg z-[100] w-full transition-all duration-300 translate-y-0' 
          : 'fixed top-0 bg-transparent w-full z-[100] -translate-y-full opacity-0'
      } transition-all duration-300`}
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/parvagues" className="text-purple-400 hover:text-purple-300 transition-colors">
            ← ParVagues
          </Link>
          {isSticky && eventName && (
            <>
              <span className="text-gray-500 mx-2">|</span>
              <span className="text-white">{eventName}</span>
            </>
          )}
        </div>
        
        {/* CTA button that appears when sticky */}
        <a 
          href="mailto:parvagues@nech.pl?subject=Booking Request&body=Bonjour,%0D%0A%0D%0AJe souhaiterais discuter d'une possibilité de performance live coding."
          className={`${styles.ctaButton} transition-all duration-300`}
          style={{ position: 'relative', top: 'auto', right: 'auto' }}
        >
          <FaEnvelope className="inline mr-2" />
          Invoquer un live
        </a>
      </div>
    </header>
  );
} 