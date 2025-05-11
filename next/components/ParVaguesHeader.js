import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaEnvelope } from 'react-icons/fa';
import styles from '@/styles/parvagues.module.css';

export default function ParVaguesHeader({ eventName = null }) {
  return (
    <header 
      className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-[#d900ff]/20 shadow-lg"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/parvagues" className="flex items-center">
            <div className="w-10 h-10 relative mr-2">
              <Image 
                src="/images/parvagues/favicon.ico" 
                alt="ParVagues Logo" 
                fill 
                className="object-contain" 
                sizes="40px"
              />
            </div>
            <span className="text-[#d900ff] text-xl font-bold">ParVagues</span>
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
          className={styles.ctaButton}
        >
          <FaEnvelope className="inline mr-2" />
          Invoquer un live
        </a>
      </div>
    </header>
  );
} 