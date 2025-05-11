import React from 'react';
import Link from 'next/link';
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
    <footer className="bg-black border-t border-purple-500/20 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Column */}
          <div>
            <h3 className="text-purple-400 font-semibold text-lg mb-4">ParVagues</h3>
            <p className="text-gray-400 text-sm mb-4">
              Livecoding de musique open-source avec TidalCycles et contrôleur MIDI. 
              Performances algorithmiques et création sonore en direct.
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-purple-400 font-semibold text-lg mb-4">Explorez</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/parvagues#music" className="text-gray-400 hover:text-purple-300 transition-colors">
                  Musique
                </Link>
              </li>
              <li>
                <Link href="/parvagues#performances" className="text-gray-400 hover:text-purple-300 transition-colors">
                  Performances
                </Link>
              </li>
              <li>
                <Link href="/parvagues#about" className="text-gray-400 hover:text-purple-300 transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:parvagues@nech.pl?subject=Booking Request" 
                  className="text-gray-400 hover:text-purple-300 transition-colors"
                >
                  Réserver un live
                </a>
              </li>
            </ul>
          </div>

          {/* Social Column */}
          <div>
            <h3 className="text-purple-400 font-semibold text-lg mb-4">Connect</h3>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((link, index) => (
                <a 
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-purple-900 text-white p-3 rounded-full transition-colors"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>© {year} ParVagues. All code is open-source.</p>
        </div>
      </div>
    </footer>
  );
} 