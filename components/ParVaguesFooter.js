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
    <footer className="bg-black border-t border-[#d900ff]/20 py-8 relative"> {/* Removed overflow-hidden */}
      <div className={styles.neonGradient}></div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start"> {/* Changed to md:grid-cols-3 and items-start */}
          {/* About Column */}
          <div className="md:col-span-1"> {/* Explicit column span */}
            <p className="text-gray-400 text-sm mb-4">
              Livecoding de musique libre<br />
              Performances algorithmiques en direct.
            </p>
            <p className="text-xs text-gray-500">
              &copy; {year} ParVagues. Tous droits réservés.
            </p>
          </div>

          {/* Logo Column (New) */}
          <div className="md:col-span-1 flex flex-col items-center justify-center"> {/* This centers the block below */}
            <div className="relative mb-4 flex justify-center"> {/* This ensures the image within this block is centered */}
              <Image 
                src="/images/parvagues/logo.png" 
                alt="ParVagues Logo" 
                width={100} // Reduced logo size
                height={100} // Reduced logo size
              />
            </div>
          </div>

          {/* Social Column */}
          <div className="md:col-span-1 flex flex-col items-center md:items-end"> {/* Explicit column span */}
            <p className="text-gray-400 text-sm mb-3 text-center md:text-right">Restons connectés :</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-end"> {/* Reduced gap */}
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-purple-700/70 text-white p-2.5 rounded-full transition-colors shadow-md hover:shadow-purple-500/40" // Slightly smaller padding
                  aria-label={link.label}
                >
                  {React.cloneElement(link.icon, { size: '1.1em' })} {/* Slightly smaller icons */}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Links - more compact and centered */}
        <div className="w-full mt-8 pt-6 border-t border-purple-500/10"> {/* Added top margin, padding and border */}
          <div className="flex justify-center items-center space-x-6 text-xs tracking-wider uppercase flex-wrap gap-y-2"> {/* Reduced space-x, added gap-y */}
            <Link href="/parvagues#music" className="text-gray-400 hover:text-purple-400 transition-colors px-2">
              Musique
            </Link>
            <Link href="/parvagues#performances" className="text-gray-400 hover:text-purple-400 transition-colors px-2">
              Performances
            </Link>
            <Link href="/parvagues#about" className="text-gray-400 hover:text-purple-400 transition-colors px-2">
              À Propos
            </Link>
            <a
              href="mailto:parvagues@nech.pl?subject=Booking Request"
              className="text-gray-400 hover:text-purple-400 transition-colors px-2"
            >
              Réserver
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}