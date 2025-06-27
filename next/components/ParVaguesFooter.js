import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaEnvelope, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { SiMastodon, SiBluesky } from 'react-icons/si';
import styles from '@/styles/parvagues.module.css';

export default function ParVaguesFooter() {
  const socialLinks = [
    { icon: <FaEnvelope />, label: 'email', url: 'mailto:parvagues@nech.pl' },
    { icon: <SiMastodon />, label: 'mastodon', url: 'https://chaos.social/@PixelNoir' },
    { icon: <FaTwitter />, label: 'twitter', url: 'https://x.com/ParVagues' },
    { icon: <SiBluesky />, label: 'bluesky', url: '#' },
    { icon: <FaInstagram />, label: 'instagram', url: 'https://instagram.com/parvagues.mp3' },
    { icon: <FaYoutube />, label: 'youtube', url: 'https://www.youtube.com/@parvagues' }
  ];

  const year = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-[#d900ff]/20 py-8 relative overflow-hidden">
      <div className={styles.neonGradient}></div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* About Column */}
          <div>
            <p className="text-gray-400 text-sm mb-4">
              Livecoding de musique libre<br />
              Performances algorithmiques en direct.
            </p>
          </div>

          {/* Social Column */}
          <div className="flex flex-col items-center md:items-end">
            <div className="flex justify-center w-full">
              <div className="relative">
                <Image 
                  src="/images/parvagues/logo.png" 
                  alt="ParVagues Logo" 
                  width={240}
                  height={240}
                  className="mx-auto mb-4" 
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-end">
              {socialLinks.map((link, index) => (
                <a 
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-[#8900b3]/60 text-white p-3 rounded-full transition-colors shadow-md hover:shadow-[#d900ff]/40"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Links - more compact */}
        <div className="w-full bg-black py-4">
          <div className="flex justify-center items-center space-x-8 text-xs tracking-widest uppercase flex-wrap">
            <Link href="/parvagues#music" className="text-gray-300 hover:text-[#ff3d7b] transition-colors tracking-wider px-3">
              MUSIQUE
            </Link>
            <Link href="/parvagues#performances" className="text-gray-300 hover:text-[#ff3d7b] transition-colors tracking-wider px-3">
              PERFORMANCES
            </Link>
            <Link href="/parvagues#about" className="text-gray-300 hover:text-[#ff3d7b] transition-colors tracking-wider px-3">
              À PROPOS
            </Link>
            <a 
              href="mailto:parvagues@nech.pl?subject=Booking Request" 
              className="text-gray-300 hover:text-[#ff3d7b] transition-colors tracking-wider px-3"
            >
              RÉSERVER
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
} 