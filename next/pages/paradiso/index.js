import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import algoliasearch from 'algoliasearch';
import { InstantSearch, SearchBox, Hits, Configure } from 'react-instantsearch-dom';
import Image from 'next/image';
import Layout from '@/components/layout';
import utilStyles from '@/styles/utils.module.css';
import styles from '@/styles/paradiso.module.css';

// Initialize the Algolia client
// TODO CONFIRM .env IS LOADED
const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
);

// Unique user token for this session - in a real app, this would be tied to user authentication
const getUserToken = () => {
  if (typeof window === 'undefined') return null;
  
  let userToken = localStorage.getItem('paradiso_user_token');
  
  if (!userToken) {
    // Generate a random user token
    userToken = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('paradiso_user_token', userToken);
  }
  
  return userToken;
};

// Movie Hit component - Displays a single movie
const MovieHit = ({ hit, onVote }) => {
  return (
    <div className={styles.movieCard}>
      {hit.poster ? (
        <div className={styles.moviePoster}>
          <Image 
            src={hit.poster} 
            alt={hit.title} 
            width={200} 
            height={300}
            layout="responsive"
          />
        </div>
      ) : (
        <div className={styles.noImagePlaceholder}>No Image</div>
      )}
      
      <div className={styles.movieInfo}>
        <h3 className={styles.movieTitle}>
          {hit.title} {hit.year && <span className={styles.movieYear}>({hit.year})</span>}
        </h3>
        
        {hit.director && (
          <p className={styles.movieDirector}>Director: {hit.director}</p>
        )}
        
        {hit.actors && hit.actors.length > 0 && (
          <p className={styles.movieActors}>Starring: {hit.actors.join(', ')}</p>
        )}
        
        {hit.plot && (
          <p className={styles.moviePlot}>{hit.plot}</p>
        )}
        
        <div className={styles.movieMeta}>
          {hit.imdbRating && (
            <span className={styles.movieRating}>⭐ {hit.imdbRating}/10</span>
          )}
          {hit.source && (
            <span className={styles.movieSource}>Source: {hit.source.toUpperCase()}</span>
          )}
        </div>
        
        <div className={styles.movieActions}>
          <button 
            onClick={() => onVote(hit.objectID)}
            className={styles.voteButton}
          >
            👍 Vote ({hit.votes || 0})
          </button>
        </div>
      </div>
    </div>
  );
};

// Empty results component
const EmptyResults = () => (
  <div className={styles.emptyResults}>
    <h3>No movies found</h3>
    <p>Try a different search or add a new movie below</p>
  </div>
);

export default function Paradiso() {
  const router = useRouter();
  const [userToken, setUserToken] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Set user token on client-side
  useEffect(() => {
    setUserToken(getUserToken());
  }, []);
  
  // Function to vote for a movie
  const handleVote = async (movieId) => {
    if (!userToken) return;
    
    try {
      // Use Algolia's partial update to increment the votes counter
      const response = await fetch('/api/paradiso/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId,
          userToken,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to vote for movie');
      }
      
      setSuccess('Vote recorded successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error voting for movie:', err);
      setError('Failed to vote for movie. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  };
  
  // Function to add a new movie
  const handleAddMovie = async (e) => {
    e.preventDefault();
    
    if (!newMovieTitle.trim() || !userToken) return;
    
    setIsAdding(true);
    setError(null);
    
    try {
      // Add the movie directly by title
      const addResponse = await fetch('/api/paradiso/add-movie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newMovieTitle,
          userToken,
        }),
      });
      
      if (!addResponse.ok) {
        const errorData = await addResponse.json();
        throw new Error(errorData.error || 'Failed to add movie');
      }
      
      setNewMovieTitle('');
      setSuccess('Movie added successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error adding movie:', err);
      setError(err.message || 'Failed to add movie. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsAdding(false);
    }
  };
  
  return (
    <Layout>
      <Head>
        <title>Paradiso - Movie Night Voting</title>
        <meta name="description" content="Vote for the next movie night film" />
      </Head>
      
      <div className={styles.container}>
        <h1 className={styles.title}>🎬 Paradiso</h1>
        <p className={styles.subtitle}>Vote pour <b>notre</b> film et écris l'avenir du <i>Cinéma Paradiso</i>.</p>
        
        {/* Error and success messages */}
        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}
        
        {/* InstantSearch component */}
        {userToken && (
          <InstantSearch 
            searchClient={searchClient} 
            indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX}
          >
            <div className={styles.searchContainer}>
              <SearchBox
                className={styles.searchBox}
                translations={{
                  placeholder: 'Search for movies...',
                }}
                onFocus={() => setIsSearching(true)}
                onBlur={() => setTimeout(() => setIsSearching(false), 200)}
              />
              
              <Configure 
                hitsPerPage={12}
                distinct={true}
              />
              
              {isSearching && (
                <div className={styles.searchResults}>
                  <Hits 
                    hitComponent={({ hit }) => (
                      <MovieHit hit={hit} onVote={handleVote} />
                    )}
                    classNames={{
                      list: styles.hitsList,
                      item: styles.hitItem,
                      empty: styles.noResults,
                    }}
                    emptyComponent={EmptyResults}
                  />
                </div>
              )}
            </div>
            
            {/* Add movie form */}
            <div className={styles.addMovieSection}>
              <h2>Can't find the movie? Add it</h2>
              <form onSubmit={handleAddMovie} className={styles.addMovieForm}>
                <input
                  type="text"
                  value={newMovieTitle}
                  onChange={(e) => setNewMovieTitle(e.target.value)}
                  placeholder="Enter movie title..."
                  disabled={isAdding}
                  required
                />
                <button 
                  type="submit" 
                  disabled={isAdding || !newMovieTitle.trim()}
                >
                  {isAdding ? 'Adding...' : 'Add Movie'}
                </button>
              </form>
              <p className={styles.infoText}>
                Movie data is fetched from TMDB, OMDB, or Wikipedia as a fallback
              </p>
            </div>
            
            {/* Top voted movies */}
            <div className={styles.topMoviesSection}>
              <h2>Top Voted Movies</h2>
              <Configure 
                hitsPerPage={5}
                filters="votes>0"
                sortCriteria={['votes:desc', 'title:asc']}
              />
              <Hits 
                hitComponent={({ hit }) => (
                  <MovieHit hit={hit} onVote={handleVote} />
                )}
                classNames={{
                  list: styles.hitsList,
                  item: styles.hitItem,
                  empty: styles.noResults,
                }}
              />
            </div>
          </InstantSearch>
        )}
      </div>
      
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .title {
          font-size: 2.5rem;
          text-align: center;
          margin-bottom: 1rem;
        }
        
        .subtitle {
          font-size: 1.2rem;
          text-align: center;
          margin-bottom: 2rem;
          color: #666;
        }
      `}</style>
    </Layout>
  );
}