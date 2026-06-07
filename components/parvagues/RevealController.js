'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Scroll-triggered reveal for `.reveal` sections. Runs after hydration and
// re-arms on client-side navigation between ParVagues pages (the segment
// layout does not remount, so we key the observer on the pathname). Sections
// stay visible without JS — CSS only hides them once `.reveal-ready` is set.
export default function RevealController() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add('reveal-ready');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
