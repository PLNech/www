import { useState, useEffect } from 'react';
import styles from '../../styles/cosmicfest.module.css';

const LABELS = { jours: 'jours', heures: 'heures', minutes: 'min', secondes: 'sec' };

function computeLeft(targetDate) {
  const diff = +new Date(targetDate) - Date.now();
  if (diff <= 0) return null;
  return {
    jours: Math.floor(diff / 86400000),
    heures: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    secondes: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown({ targetDate }) {
  // undefined = not yet mounted (SSR / first paint) → neutral "--" placeholder, so the
  //   server never wrongly claims the event is happening now.
  // null = actually expired → the celebratory message.
  // object = live remaining time.
  const [left, setLeft] = useState(undefined);

  useEffect(() => {
    setLeft(computeLeft(targetDate));
    const id = setInterval(() => setLeft(computeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (left === null) {
    return (
      <div className={styles.countdown} aria-live="polite">
        <span className={styles.countDone}>c&rsquo;est l&rsquo;heure. on s&rsquo;intrique. 🌀</span>
      </div>
    );
  }

  return (
    <div className={styles.countdown} aria-label="compte à rebours jusqu'au jour J">
      {Object.keys(LABELS).map((unit) => (
        <span key={unit} className={styles.countUnit}>
          <span className={styles.countNum}>
            {left ? String(left[unit]).padStart(2, '0') : '--'}
          </span>
          <span className={styles.countLabel}>{LABELS[unit]}</span>
        </span>
      ))}
    </div>
  );
}
