/**
 * Movie Repository Interface Abstraction
 * 
 * This file defines repository interfaces for storing movie data and votes
 * Currently implements Algolia, but could be extended to other storage mechanisms
 */

import { algoliasearch } from 'algoliasearch';

/**
 * Base MovieRepository interface
 * Any movie repository should implement this interface
 */
class MovieRepository {
  /**
   * Add a movie to the repository
   * @param {object} movieData - Normalized movie data
   * @param {string} userId - ID of the user adding the movie
   * @returns {Promise<object>} - The stored movie
   */
  async addMovie(movieData, userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Check if a movie exists in the repository
   * @param {string} movieId - The movie ID
   * @returns {Promise<boolean>} - True if exists, false otherwise
   */
  async movieExists(movieId) {
    throw new Error('Method not implemented');
  }

  /**
   * Vote for a movie
   * @param {string} movieId - The movie ID
   * @param {string} userId - ID of the user voting
   * @returns {Promise<boolean>} - True if vote was successful, false otherwise
   */
  async voteForMovie(movieId, userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get a movie by ID
   * @param {string} movieId - The movie ID
   * @returns {Promise<object|null>} - The movie data or null if not found
   */
  async getMovie(movieId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get top voted movies
   * @param {number} count - Number of movies to return
   * @returns {Promise<Array<object>>} - Array of movie data
   */
  async getTopMovies(count = 5) {
    throw new Error('Method not implemented');
  }

  /**
   * Search for movies
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results to return
   * @returns {Promise<Array<object>>} - Array of movie data
   */
  async searchMovies(query, limit = 10) {
    throw new Error('Method not implemented');
  }

  /**
   * Get all movies
   * @param {number} limit - Maximum number of results to return
   * @returns {Promise<Array<object>>} - Array of movie data
   */
  async getAllMovies(limit = 100) {
    throw new Error('Method not implemented');
  }

  /**
   * Remove a movie
   * @param {string} movieId - The movie ID
   * @returns {Promise<boolean>} - True if removal was successful
   */
  async removeMovie(movieId) {
    throw new Error('Method not implemented');
  }
}

/**
 * Algolia implementation of MovieRepository
 */
class AlgoliaMovieRepository extends MovieRepository {
  constructor(appId, apiKey, moviesIndex, votesIndex) {
    super();
    this.client = algoliasearch(appId, apiKey);
    this.moviesIndex = this.client.initIndex(moviesIndex);
    this.votesIndex = this.client.initIndex(votesIndex);
  }

  /**
   * Generate a user token for Algolia
   * @param {string} userId - User ID
   * @returns {string} - User token
   */
  generateUserToken(userId) {
    return userId.startsWith('discord_') ? userId : `user_${userId}`;
  }

  async addMovie(movieData, userId) {
    // Check if movie already exists
    if (await this.movieExists(movieData.id)) {
      throw new Error('Movie already exists');
    }

    // Format the movie data for Algolia
    const algoliaMovie = {
      objectID: movieData.id,
      title: movieData.title,
      originalTitle: movieData.originalTitle || movieData.title,
      year: movieData.year,
      director: movieData.director || 'Unknown',
      actors: movieData.actors || [],
      genre: movieData.genre || [],
      plot: movieData.plot || '',
      poster: movieData.poster,
      imdbRating: movieData.imdbRating,
      imdbID: movieData.imdbID,
      tmdbID: movieData.tmdbID,
      votes: 0,
      addedDate: Date.now(),
      addedBy: this.generateUserToken(userId),
      source: movieData.source || 'unknown'
    };

    // Save to Algolia
    await this.moviesIndex.saveObject(algoliaMovie);
    return algoliaMovie;
  }

  async movieExists(movieId) {
    const searchResponse = await this.moviesIndex.search('', {
      filters: `objectID:${movieId}`,
    });
    return searchResponse.hits.length > 0;
  }

  async voteForMovie(movieId, userId) {
    const userToken = this.generateUserToken(userId);
    
    // Check if user already voted for this movie
    const searchResult = await this.votesIndex.search('', {
      filters: `userToken:${userToken} AND movieId:${movieId}`
    });
    
    if (searchResult.nbHits > 0) {
      return false; // User already voted
    }
    
    // Record the vote
    await this.votesIndex.saveObject({
      objectID: `${userToken}_${movieId}`,
      userToken: userToken,
      movieId: movieId,
      timestamp: Date.now()
    });
    
    // Increment the movie's vote count
    await this.moviesIndex.partialUpdateObject({
      objectID: movieId,
      votes: {
        _operation: 'Increment',
        value: 1
      }
    });
    
    return true;
  }

  async getMovie(movieId) {
    try {
      const movie = await this.moviesIndex.getObject(movieId);
      return movie;
    } catch (error) {
      return null;
    }
  }

  async getTopMovies(count = 5) {
    const searchResult = await this.moviesIndex.search('', {
      filters: 'votes > 0',
      hitsPerPage: count,
      sortCriteria: ['votes:desc']
    });
    
    return searchResult.hits;
  }

  async searchMovies(query, limit = 10) {
    const searchResult = await this.moviesIndex.search(query, {
      hitsPerPage: limit
    });
    
    return searchResult.hits;
  }

  async getAllMovies(limit = 100) {
    const searchResult = await this.moviesIndex.search('', {
      hitsPerPage: limit
    });
    
    return searchResult.hits;
  }

  async removeMovie(movieId) {
    try {
      await this.moviesIndex.deleteObject(movieId);
      
      // Delete all votes for this movie
      const votesResponse = await this.votesIndex.search('', {
        filters: `movieId:${movieId}`,
        hitsPerPage: 100
      });
      
      const voteIds = votesResponse.hits.map(hit => hit.objectID);
      if (voteIds.length > 0) {
        await this.votesIndex.deleteObjects(voteIds);
      }
      
      return true;
    } catch (error) {
      console.error('Error removing movie:', error);
      return false;
    }
  }
}

/**
 * Repository Factory to create the appropriate repository
 */
class MovieRepositoryFactory {
  static createRepository(type, config) {
    switch (type.toLowerCase()) {
      case 'algolia':
        return new AlgoliaMovieRepository(
          config.appId,
          config.apiKey,
          config.moviesIndex,
          config.votesIndex
        );
      default:
        throw new Error(`Unsupported repository type: ${type}`);
    }
  }
}

export { MovieRepository, AlgoliaMovieRepository, MovieRepositoryFactory }; 