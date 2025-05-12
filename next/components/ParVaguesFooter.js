import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaEnvelope, FaInstagram, FaTwitter } from 'react-icons/fa';
import { SiMastodon, SiBluesky } from 'react-icons/si';
import styles from '@/styles/parvagues.module.css';

export default function ParVaguesFooter() {
  const socialLinks = [
    { icon: <FaEnvelope />, label: 'email', url: 'mailto:parvagues@nech.pl' },
    { icon: <SiMastodon />, label: 'mastodon', url: 'https://chaos.social/@PixelNoir' },
    { icon: <FaTwitter />, label: 'twitter', url: 'https://x.com/ParVagues' },
    { icon: <SiBluesky />, label: 'bluesky', url: '#' },
    { icon: <FaInstagram />, label: 'instagram', url: 'https://instagram.com/parvagues.mp3' }
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
              Livecoding de musique open-source avec TidalCycles et contrôleur MIDI.<br />
              Performances algorithmiques et création sonore en direct.
            </p>
          </div>

          {/* Social Column */}
          <div className="flex flex-col items-center md:items-end">
          <div className="flex justify-center mb-4 md:mb-0 md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
          <Image 
            src="/images/parvagues/logo_text.png" 
            alt="ParVagues Logo" 
            width={96}
            height={96}
            className="md:mt-16" 
          />
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
        <div className="w-full bg-black py-4 my-4">
          <div className="flex justify-center items-center space-x-4 text-xs tracking-widest uppercase flex-wrap">
            <Link href="/parvagues#music" className="text-gray-300 hover:text-[#ff3d7b] transition-colors">
              MUSIQUE
            </Link>
            <Link href="/parvagues#performances" className="text-gray-300 hover:text-[#ff3d7b] transition-colors">
              PERFORMANCES
            </Link>
            <Link href="/parvagues#about" className="text-gray-300 hover:text-[#ff3d7b] transition-colors">
              À PROPOS
            </Link>
            <a 
              href="mailto:parvagues@nech.pl?subject=Booking Request" 
              className="text-gray-300 hover:text-[#ff3d7b] transition-colors"
            >
              RÉSERVER
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-4 pt-4 text-center text-gray-500 text-xs">
          <p>© {year} ParVagues. All code is open-source.</p>
        </div>
      </div>
    </footer>
  );
} 