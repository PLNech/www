import React, { useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/paradiso.module.css';

const MovieCard = ({ movie, onVote }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isVoting) return;
    
    setIsVoting(true);
    await onVote(movie.objectID);
    setIsVoting(false);
  };

  return (
    <div 
      className={styles.movieCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.posterContainer}>
        {movie.poster ? (
          <Image 
            src={movie.poster} 
            alt={movie.title}
            width={200}
            height={300}
            className={styles.poster}
            unoptimized
          />
        ) : (
          <div className={styles.noPoster}>
            <span>{movie.title}</span>
          </div>
        )}
        
        {isHovered && (
          <div className={styles.movieOverlay}>
            <h3 className={styles.movieTitle}>{movie.title}</h3>
            <div className={styles.movieYear}>{movie.year}</div>
            <div className={styles.movieRating}>
              ⭐ {movie.imdbRating || 'N/A'}
            </div>
            <div className={styles.movieGenres}>
              {movie.genre && movie.genre.slice(0, 3).join(' • ')}
            </div>
            <p className={styles.moviePlot}>
              {movie.plot && movie.plot.length > 150 
                ? `${movie.plot.substring(0, 150)}...` 
                : movie.plot}
            </p>
            <div className={styles.movieActions}>
              <button 
                className={styles.voteButton}
                onClick={handleVote}
                disabled={isVoting}
              >
                {isVoting ? 'Voting...' : `Vote (${movie.votes || 0})`}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className={styles.movieInfo}>
        <h4>{movie.title}</h4>
        <div className={styles.movieMeta}>
          <span>{movie.year}</span>
          <span className={styles.votes}>{movie.votes || 0} votes</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;