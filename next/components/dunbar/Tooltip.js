import React from 'react';
import styles from '@/styles/dunbar.module.css';

export default function Tooltip({ x, y, visible, children }) {
  if (!visible) return null;
  // Keep tooltip within viewport bounds with a small offset
  const offset = 12;
  const style = {
    left: Math.max(8, x + offset),
    top: Math.max(8, y + offset),
  };
  return (
    <div className={styles.tooltip} style={style} role="tooltip">
      {children}
    </div>
  );
}
