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
  const showInHeader = useScrolledPast(300); // Threshold for showing title on scroll
  const headerTitle = title || eventName || 'ParVagues';

  return (
    <header className={`sticky top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-[#d900ff]/20 ${styles.headerContainer}`}>
      <div className={`${styles.neonGradient} opacity-5 absolute inset-0`}></div>
      <div className="max-w-full mx-auto px-4 flex items-center justify-between h-16"> {/* Reduced height here, e.g. h-16 for 4rem */}
        {/* Logo and Title */}
        <Link href="/parvagues" className="flex items-center group">
          <div className="h-10 w-10 relative flex-shrink-0"> {/* Ensure logo size is controlled */}
            <Image
              src="/images/parvagues/logo.png"
              alt="ParVagues Logo"
              width={40} // Adjusted size
              height={40} // Adjusted size
              className="object-contain transition-all duration-300 group-hover:filter group-hover:drop-shadow-[0_0_8px_rgba(217,0,255,0.7)]"
            />
          </div>
          <div className="overflow-hidden ml-3"> {/* Increased margin slightly */}
            <span
              className={`text-white font-bold transition-all duration-500 ${
                showInHeader || !isHome ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full' // Adjusted animation
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

        {/* Navigation Links */}
        <nav className="flex-grow flex justify-center items-center space-x-6 text-sm tracking-wider">
          <Link href="/parvagues#music" className={`${styles.navLink} text-gray-300 hover:text-[#ff3d7b] transition-colors`}>
            Music
          </Link>
          <Link href="/parvagues#performances" className={`${styles.navLink} text-gray-300 hover:text-[#ff3d7b] transition-colors`}>
            Performances
          </Link>
          <Link href="/parvagues#about" className={`${styles.navLink} text-gray-300 hover:text-[#ff3d7b] transition-colors`}>
            About
          </Link>
        </nav>

        {/* CTA button */}
        <Link
          href="/book"
          className={`${styles.outlineButton} ${styles.bookButton} py-2 px-4 text-sm flex items-center whitespace-nowrap`} // Added custom class for specific styling if needed
        >
          <FaEnvelope className="mr-2 flex-shrink-0" />
          <span>Book</span>
        </Link>
      </div>
    </header>
  );
}
