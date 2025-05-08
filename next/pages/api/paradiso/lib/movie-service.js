/**
 * Movie Service Layer
 * 
 * This service provides a unified interface for interacting with movie data sources
 * and repositories, abstracting the underlying implementation details.
 */

import { MovieSourceFactory } from './movie-sources';
import { MovieRepositoryFactory } from './movie-repository';

class MovieService {
  /**
   * Create a new MovieService instance
   * @param {Object} config - Service configuration
   * @param {Object} config.dataSource - Data source configuration
   * @param {string} config.dataSource.type - Data source type ('omdb', 'tmdb')
   * @param {string} config.dataSource.apiKey - API key for the data source
   * @param {Object} config.repository - Repository configuration
   * @param {string} config.repository.type - Repository type ('algolia')
   * @param {Object} config.repository.config - Repository-specific configuration
   */
  constructor(config) {
    // Set up data sources with fallback cascade
    const dataSources = MovieSourceFactory.createDataSourceCascade(config);
    this.dataSource = dataSources.primary;
    this.fallbackDataSources = dataSources.fallbacks;
    
    // Set up repository
    this.repository = MovieRepositoryFactory.createRepository(
      config.repository.type,
      config.repository.config
    );
  }

  /**
   * Search for a movie by title
   * @param {string} title - Movie title to search for
   * @returns {Promise<Object|null>} - Movie data or null if not found
   */
  async searchMovie(title) {
    // Try primary data source first
    let movieData = await this.dataSource.searchByTitle(title);
    
    // Try each fallback source in order until we find a result
    if (!movieData) {
      for (const fallbackSource of this.fallbackDataSources) {
        movieData = await fallbackSource.searchByTitle(title);
        if (movieData) {
          console.info(`Found movie using fallback source: ${fallbackSource.constructor.name}`);
          break;
        }
      }
    }
    
    return movieData;
  }

  /**
   * Add a movie to the repository
   * @param {string} title - Movie title to search and add
   * @param {string} userId - ID of the user adding the movie
   * @returns {Promise<Object>} - The added movie data
   */
  async addMovie(title, userId) {
    // First, search for the movie in the data source
    const movieData = await this.searchMovie(title);
    
    if (!movieData) {
      throw new Error('Movie not found');
    }
    
    // Check if the movie already exists in the repository
    const movieExists = await this.repository.movieExists(movieData.id);
    
    if (movieExists) {
      throw new Error('Movie already exists');
    }
    
    // Add the movie to the repository
    return await this.repository.addMovie(movieData, userId);
  }

  /**
   * Vote for a movie
   * @param {string} movieId - ID of the movie to vote for
   * @param {string} userId - ID of the user voting
   * @returns {Promise<boolean>} - True if vote was successful, false otherwise
   */
  async voteForMovie(movieId, userId) {
    return await this.repository.voteForMovie(movieId, userId);
  }

  /**
   * Get top voted movies
   * @param {number} count - Number of movies to return
   * @returns {Promise<Array<Object>>} - Array of movie data
   */
  async getTopMovies(count = 5) {
    return await this.repository.getTopMovies(count);
  }

  /**
   * Get all movies
   * @param {number} limit - Maximum number of movies to return
   * @returns {Promise<Array<Object>>} - Array of movie data
   */
  async getAllMovies(limit = 100) {
    return await this.repository.getAllMovies(limit);
  }

  /**
   * Search for movies in the repository
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array<Object>>} - Array of movie data
   */
  async searchMoviesInRepository(query, limit = 10) {
    return await this.repository.searchMovies(query, limit);
  }

  /**
   * Remove a movie from the repository
   * @param {string} movieId - ID of the movie to remove
   * @returns {Promise<boolean>} - True if removal was successful
   */
  async removeMovie(movieId) {
    return await this.repository.removeMovie(movieId);
  }
}

/**
 * Create a movie service with the default configuration from environment variables
 * @returns {MovieService} - Configured movie service
 */
function createDefaultMovieService() {
  // Determine preferred data source
  const movieDataSource = process.env.MOVIE_DATA_SOURCE || 'tmdb';
  
  return new MovieService({
    dataSource: {
      type: movieDataSource,
      apiKey: movieDataSource === 'tmdb' ? process.env.TMDB_API_KEY : process.env.OMDB_API_KEY,
      fallback: {
        type: movieDataSource === 'tmdb' ? 'omdb' : 'tmdb',
        apiKey: movieDataSource === 'tmdb' ? process.env.OMDB_API_KEY : process.env.TMDB_API_KEY
      }
    },
    repository: {
      type: 'algolia',
      config: {
        appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
        apiKey: process.env.ALGOLIA_ADMIN_API_KEY,
        moviesIndex: process.env.NEXT_PUBLIC_ALGOLIA_INDEX,
        votesIndex: process.env.ALGOLIA_VOTES_INDEX || 'paradiso_votes'
      }
    }
  });
}

export { MovieService, createDefaultMovieService }; 