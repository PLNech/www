import React, { useState } from 'react';
import styles from '../styles/paradiso.module.css';

const MovieSearch = ({ onAddMovie }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  // Function to search for movies via TMDB
  const searchMovies = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=3e1dd2bcd5e1265d986c9a1501d6f8c0&query=${encodeURIComponent(searchQuery)}&language=en-US&page=1&include_adult=false`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search for movies');
      }
      
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching for movies:', error);
      setError('Failed to search for movies. Please try again later.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Function to add a movie from search results
  const handleAddMovie = (movie) => {
    const newMovieObj = {
      id: movie.id.toString(),
      title: movie.title,
      votes: 0,
      addedDate: new Date().toISOString(),
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      description: movie.overview || null,
      year: movie.release_date ? movie.release_date.substring(0, 4) : null
    };
    
    onAddMovie(newMovieObj);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className={styles.searchContainer}>
      <h3>Find a Movie</h3>
      
      {/* Search Form */}
      <form onSubmit={searchMovies} className={styles.searchBar}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a movie..."
        />
        <button 
          type="submit"
          disabled={searching || !searchQuery.trim()}
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className={styles.searchResults}>
          <h4>Search Results</h4>
          <div className={styles.movieGrid}>
            {searchResults.slice(0, 5).map(movie => (
              <div key={movie.id} className={styles.searchResultItem}>
                {movie.poster_path ? (
                  <img 
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                    alt={movie.title} 
                    className={styles.searchResultPoster}
                  />
                ) : (
                  <div className={styles.searchResultPoster} style={{ 
                    backgroundColor: '#eee', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#999'
                  }}>
                    No Image
                  </div>
                )}
                <div className={styles.searchResultInfo}>
                  <h5>{movie.title} {movie.release_date && `(${movie.release_date.substring(0, 4)})`}</h5>
                  {movie.overview && (
                    <p>{movie.overview.length > 100 ? `${movie.overview.substring(0, 100)}...` : movie.overview}</p>
                  )}
                  <button 
                    onClick={() => handleAddMovie(movie)}
                    className={styles.addButton}
                  >
                    Add to List
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* No Results Message */}
      {searchResults.length === 0 && searchQuery && !searching && !error && (
        <div className={styles.noResults}>
          No results found for "{searchQuery}". Try a different search term.
        </div>
      )}
    </div>
  );
};

export default MovieSearch;