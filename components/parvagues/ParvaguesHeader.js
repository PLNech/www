'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FaEnvelope } from 'react-icons/fa';

export default function ParvaguesHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[var(--surface)]/95 backdrop-blur-md border-b border-white/[0.06]'
          : ''
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/parvagues" className="flex items-center gap-3 group">
          <Image
            src="/images/parvagues/logo.png"
            alt="ParVagues"
            width={28}
            height={28}
            className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(217,0,255,0.5)]"
          />
          <span
            className="font-display font-bold text-xs tracking-[0.15em] uppercase transition-opacity duration-500"
            style={{ opacity: scrolled ? 1 : 0 }}
          >
            ParVagues
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.2em] uppercase">
          {['tour', 'music', 'video', 'booking'].map((id) => (
            <a
              key={id}
              href={`/parvagues#${id}`}
              className="text-[var(--text-muted)] hover:text-white transition-colors duration-300"
            >
              {id}
            </a>
          ))}
        </nav>

        <a
          href="/parvagues#booking"
          className="flex items-center gap-2 px-4 py-2 text-[11px] tracking-[0.15em] uppercase border border-white/20 rounded-full hover:bg-white hover:text-[var(--surface)] transition-all duration-300"
        >
          <FaEnvelope className="w-3 h-3" />
          <span className="hidden sm:inline">Book</span>
        </a>
      </div>
    </header>
  );
}
