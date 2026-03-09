import { useState, useEffect } from 'react';

export default function Countdown({ targetDate, onPhaseChange }) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents = [];

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval]) {
            return;
        }

        timerComponents.push(
            <span key={interval} className="mx-2">
                <span className="text-4xl font-bold font-mono text-white">{timeLeft[interval]}</span>
                <span className="text-sm text-gray-400 uppercase ml-1">{interval}</span>
            </span>
        );
    });

    return (
        <div className="flex justify-center items-center p-6 bg-black/50 rounded-xl border border-purple-500/30">
            {timerComponents.length ? timerComponents : <span className="text-2xl font-bold text-white">Event Started!</span>}
        </div>
    );
}
