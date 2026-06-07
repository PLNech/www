import { useState, useEffect } from 'react';
import styles from '../../styles/cosmicfest.module.css'; // Assuming you might want specific styles

const Countdown = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        jours: Math.floor(difference / (1000 * 60 * 60 * 24)),
        heures: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        secondes: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { jours: 0, heures: 0, minutes: 0, secondes: 0 };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && timeLeft[interval] !== 0) { // handles case where initial timeLeft is empty
      return;
    }

    timerComponents.push(
      <span key={interval} style={{ margin: '0 0.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{timeLeft[interval]}</div>
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>{interval}</div>
      </span>
    );
  });

  return (
    <div className={styles.countdown} style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline' }}>
      {timerComponents.length ? timerComponents : <span>c'est l'heure!</span>}
    </div>
  );
};

export default Countdown;
