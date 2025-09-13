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
      <div className="max-w-full mx-auto px-4 sm:px-6 flex items-center justify-between h-16"> {/* Adjusted padding for responsiveness */}
        {/* Logo and Title */}
        <Link href="/parvagues" className="flex items-center group flex-shrink-0"> {/* Added flex-shrink-0 */}
          <div className="h-10 w-10 relative"> {/* Simplified logo div */}
            <Image
              src="/images/parvagues/logo.png"
              alt="ParVagues Logo"
              width={40}
              height={40}
              className="object-contain transition-all duration-300 group-hover:filter group-hover:drop-shadow-[0_0_8px_rgba(217,0,255,0.7)]"
            />
          </div>
          <div className="overflow-hidden ml-3">
            <span
              className={`text-white font-bold transition-all duration-500 whitespace-nowrap ${ /* Added whitespace-nowrap */
                showInHeader || !isHome ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
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
        {/* Ensure this nav doesn't cause overflow issues on very small screens - links might need to wrap or hide */}
        <nav className="flex-grow flex justify-center items-center space-x-4 md:space-x-6 text-sm tracking-wider mx-2 sm:mx-4"> {/* Added horizontal margin */}
          <Link href="/parvagues#music" className={`${styles.navLink} text-gray-300 hover:text-[#ff3d7b] transition-colors px-2 py-1 sm:px-3`}> {/* Added padding for touch targets */}
            Music
          </Link>
          <Link href="/parvagues#performances" className={`${styles.navLink} text-gray-300 hover:text-[#ff3d7b] transition-colors px-2 py-1 sm:px-3`}>
            Performances
          </Link>
          <Link href="/parvagues#about" className={`${styles.navLink} text-gray-300 hover:text-[#ff3d7b] transition-colors px-2 py-1 sm:px-3`}>
            About
          </Link>
        </nav>

        {/* CTA button */}
        <Link
          href="/book"
          className={`${styles.outlineButton} ${styles.bookButton} py-2 px-3 sm:px-4 text-xs sm:text-sm flex items-center whitespace-nowrap flex-shrink-0`} /* Adjusted padding, font size, added flex-shrink-0 */
        >
          <FaEnvelope className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> {/* Responsive icon size */}
          <span>Book</span>
        </Link>
      </div>
    </header>
  );
}
