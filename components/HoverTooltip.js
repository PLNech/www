import React, { useState, useRef, useEffect } from 'react';
import styles from '@/styles/utils.module.css';

export default function HoverTooltip({ children, content, links }) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);
  
  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(true);
  };
  
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 1000); // 1 second delay before hiding
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <span 
      className={styles.hoverTrigger}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      tabIndex="0"
    >
      {children}
      {isVisible && (
        <div className={styles.hoverPopup}>
          <div className={styles.popupContent}>
            {/* Support for JSX content */}
            <div className={styles.popupText}>
              {typeof content === 'string' ? <p>{content}</p> : content}
            </div>
            {links && links.length > 0 && (
              <div className={styles.popupLinks}>
                {links.map((link, index) => (
                  <a 
                    key={index} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </span>
  );
} 