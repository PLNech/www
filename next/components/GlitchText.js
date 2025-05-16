import { useState, useEffect, useRef } from 'react';

export default function GlitchText({ text, className, burstFrequency = 30000 }) {
  const [displayText, setDisplayText] = useState(text);
  const [isBursting, setIsBursting] = useState(false);
  const burstTimeoutRef = useRef(null);
  const glitchIntervalRef = useRef(null);

  // Collection of diacritical marks to add to characters
  const diacritics = [
    '\u0301', // Acute accent
    '\u0300', // Grave accent
    '\u0308', // Diaeresis
    '\u0303', // Tilde
    '\u0327', // Cedilla
    '\u0306', // Breve
    '\u0304', // Macron
    '\u0302', // Circumflex
    '\u030C', // Caron
    '\u0307', // Dot above
    '\u0328', // Ogonek
    '\u0323', // Dot below
    '\u0331', // Macron below
    '\u0337', // Short overlay
  ];

  // More intense effects for burst mode
  const cursedCombiningMarks = [
    '\u035C', // Double breve below
    '\u035F', // Combining double macron below
    '\u0360', // Combining double tilde
    '\u0361', // Combining double inverted breve
    '\u0362', // Combining double rightwards arrow below
    '\u0489', // Combining cyrillic millions sign
    '\u036F', // Combining latin small letter x
    '\u033E', // Combining vertical tilde
    '\u035D', // Combining double breve
    '\u0346', // Combining bridge above
    '\u031A', // Combining left angle above
    '\u0359', // Combining asterisk below
  ];

  const applyRandomDiacritic = (char) => {
    // Don't apply diacritics to spaces
    if (char === ' ') return char;
    
    const shouldAddDiacritic = Math.random() < (isBursting ? 0.8 : 0.1);
    if (!shouldAddDiacritic) return char;
    
    // During bursts, possibly apply multiple diacritics
    if (isBursting && Math.random() < 0.4) {
      const numMarks = Math.floor(Math.random() * 3) + 1;
      let result = char;
      
      const allMarks = [...diacritics, ...cursedCombiningMarks];
      
      for (let i = 0; i < numMarks; i++) {
        const mark = allMarks[Math.floor(Math.random() * allMarks.length)];
        result += mark;
      }
      
      return result;
    }
    
    // Normal mode - just add a single diacritic
    const diacritic = diacritics[Math.floor(Math.random() * diacritics.length)];
    return char + diacritic;
  };

  const glitchText = () => {
    const glitchIntensity = isBursting ? 0.8 : 0.05;
    
    // Apply glitch to the text
    const glitchedText = Array.from(text).map(char => {
      // Chance to apply a diacritic
      if (Math.random() < glitchIntensity) {
        return applyRandomDiacritic(char);
      }
      return char;
    }).join('');
    
    setDisplayText(glitchedText);
  };

  const startBurst = () => {
    setIsBursting(true);
    
    // Clear any existing interval
    if (glitchIntervalRef.current) {
      clearInterval(glitchIntervalRef.current);
    }
    
    // Create a faster interval during burst
    glitchIntervalRef.current = setInterval(glitchText, 100);
    
    // End burst after 1-2 seconds
    setTimeout(() => {
      setIsBursting(false);
      clearInterval(glitchIntervalRef.current);
      glitchIntervalRef.current = setInterval(glitchText, 2000);
    }, 1000 + Math.random() * 1000);
  };

  // Setup effect - runs when component mounts or when burstFrequency changes
  useEffect(() => {
    // Clean up any existing intervals and timeouts
    if (glitchIntervalRef.current) {
      clearInterval(glitchIntervalRef.current);
    }
    if (burstTimeoutRef.current) {
      clearTimeout(burstTimeoutRef.current);
    }
    
    // Initial setup - slow glitch every 2 seconds
    glitchIntervalRef.current = setInterval(glitchText, 2000);
    
    // Set up random bursts
    const scheduleBurst = () => {
      const nextBurstTime = burstFrequency + (Math.random() * burstFrequency * 0.5);
      burstTimeoutRef.current = setTimeout(() => {
        startBurst();
        scheduleBurst();
      }, nextBurstTime);
    };
    
    // Trigger immediate glitch to show effect immediately
    glitchText();
    
    // Schedule the first burst
    scheduleBurst();
    
    // Cleanup on unmount or when dependencies change
    return () => {
      clearInterval(glitchIntervalRef.current);
      clearTimeout(burstTimeoutRef.current);
    };
  }, [burstFrequency]); // Add burstFrequency as a dependency

  return (
    <span className={className} data-text={text}>
      {displayText}
    </span>
  );
} 