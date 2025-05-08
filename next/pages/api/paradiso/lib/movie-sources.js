/**
 * Movie Data Source Interface Abstraction
 * 
 * This file defines interfaces for different movie data sources (OMDB, TMDB)
 * and provides concrete implementations.
 */

/**
 * Base MovieDataSource interface
 * Any movie data provider should implement this interface
 */
class MovieDataSource {
  /**
   * Search for a movie by title
   * @param {string} title - The movie title to search for
   * @returns {Promise<object|null>} - Movie data or null if not found
   */
  async searchByTitle(title) {
    throw new Error('Method not implemented');
  }

  /**
   * Search for a movie by ID
   * @param {string} id - The movie ID (could be IMDB ID, TMDB ID, etc.)
   * @param {string} idType - The type of ID (imdb, tmdb, etc.)
   * @returns {Promise<object|null>} - Movie data or null if not found
   */
  async searchById(id, idType) {
    throw new Error('Method not implemented');
  }

  /**
   * Normalize the movie data to a consistent format
   * @param {object} rawData - Raw data from the API
   * @returns {object} - Normalized movie data
   */
  normalizeMovie(rawData) {
    throw new Error('Method not implemented');
  }
}

/**
 * OMDB API Implementation
 */
class OMDBDataSource extends MovieDataSource {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.baseUrl = 'http://www.omdbapi.com/';
  }

  async searchByTitle(title) {
    try {
      const response = await fetch(`${this.baseUrl}?apikey=${this.apiKey}&t=${encodeURIComponent(title)}&plot=full`);
      
      if (!response.ok) {
        throw new Error(`OMDB API returned ${response.status}`);
      }

      const data = await response.json();
      return data.Response === 'True' ? this.normalizeMovie(data) : null;
    } catch (error) {
      console.error('Error searching OMDB by title:', error);
      return null;
    }
  }

  async searchById(id, idType = 'imdb') {
    if (idType !== 'imdb') {
      throw new Error('OMDB only supports IMDB IDs');
    }

    try {
      const response = await fetch(`${this.baseUrl}?apikey=${this.apiKey}&i=${id}&plot=full`);
      
      if (!response.ok) {
        throw new Error(`OMDB API returned ${response.status}`);
      }

      const data = await response.json();
      return data.Response === 'True' ? this.normalizeMovie(data) : null;
    } catch (error) {
      console.error('Error searching OMDB by ID:', error);
      return null;
    }
  }

  normalizeMovie(rawData) {
    return {
      id: rawData.imdbID,
      title: rawData.Title,
      originalTitle: rawData.Title,
      year: parseInt(rawData.Year) || null,
      director: rawData.Director,
      actors: rawData.Actors ? rawData.Actors.split(', ') : [],
      genre: rawData.Genre ? rawData.Genre.split(', ') : [],
      plot: rawData.Plot,
      poster: rawData.Poster !== 'N/A' ? rawData.Poster : null,
      imdbRating: rawData.imdbRating !== 'N/A' ? parseFloat(rawData.imdbRating) : null,
      imdbID: rawData.imdbID,
      source: 'omdb',
      rawData: rawData
    };
  }
}

/**
 * TMDB API Implementation
 */
class TMDBDataSource extends MovieDataSource {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.themoviedb.org/3';
    this.imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  }

  async searchByTitle(title) {
    try {
      // First search for the movie
      const searchResponse = await fetch(
        `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(title)}&include_adult=false`
      );
      
      if (!searchResponse.ok) {
        throw new Error(`TMDB API returned ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      
      if (!searchData.results || searchData.results.length === 0) {
        return null;
      }

      // Get the most relevant result
      const movieId = searchData.results[0].id;
      
      // Get detailed info about the movie
      return await this.searchById(movieId, 'tmdb');
    } catch (error) {
      console.error('Error searching TMDB by title:', error);
      return null;
    }
  }

  async searchById(id, idType = 'tmdb') {
    try {
      let movieId = id;
      
      // If ID is IMDb ID, first search for TMDB ID
      if (idType === 'imdb') {
        const findResponse = await fetch(
          `${this.baseUrl}/find/${id}?api_key=${this.apiKey}&external_source=imdb_id`
        );
        
        if (!findResponse.ok) {
          throw new Error(`TMDB API returned ${findResponse.status}`);
        }
        
        const findData = await findResponse.json();
        
        if (!findData.movie_results || findData.movie_results.length === 0) {
          return null;
        }
        
        movieId = findData.movie_results[0].id;
      }

      // Get detailed movie info
      const detailsResponse = await fetch(
        `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&append_to_response=credits`
      );
      
      if (!detailsResponse.ok) {
        throw new Error(`TMDB API returned ${detailsResponse.status}`);
      }

      const movieData = await detailsResponse.json();
      return this.normalizeMovie(movieData);
    } catch (error) {
      console.error('Error searching TMDB by ID:', error);
      return null;
    }
  }

  normalizeMovie(rawData) {
    // Extract director from credits
    let director = 'Unknown';
    if (rawData.credits && rawData.credits.crew) {
      const directors = rawData.credits.crew
        .filter(member => member.job === 'Director')
        .map(director => director.name);
      
      director = directors.length > 0 ? directors.join(', ') : 'Unknown';
    }

    // Extract actors from credits
    let actors = [];
    if (rawData.credits && rawData.credits.cast) {
      actors = rawData.credits.cast
        .slice(0, 5) // Get top 5 actors
        .map(actor => actor.name);
    }

    return {
      id: rawData.id.toString(),
      title: rawData.title,
      originalTitle: rawData.original_title,
      year: rawData.release_date ? parseInt(rawData.release_date.substring(0, 4)) : null,
      director,
      actors,
      genre: rawData.genres ? rawData.genres.map(genre => genre.name) : [],
      plot: rawData.overview,
      poster: rawData.poster_path ? `${this.imageBaseUrl}${rawData.poster_path}` : null,
      imdbRating: rawData.vote_average ? parseFloat(rawData.vote_average) : null,
      imdbID: rawData.imdb_id || null,
      tmdbID: rawData.id.toString(),
      source: 'tmdb',
      rawData: rawData
    };
  }
}

/**
 * Wikipedia Fallback Implementation
 * Uses public web APIs to get basic movie information when other sources fail
 */
class WikipediaDataSource extends MovieDataSource {
  constructor() {
    super();
    this.baseUrl = 'https://en.wikipedia.org/api/rest_v1';
  }

  async searchByTitle(title) {
    try {
      // Search Wikipedia for the movie
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}%20film&format=json&origin=*`;
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        throw new Error(`Wikipedia API search returned ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      
      if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) {
        return null;
      }

      // Get the first result that has "film" in the title or snippet
      let pageTitle = null;
      for (const result of searchData.query.search) {
        if (result.title.toLowerCase().includes('film') || 
            result.snippet.toLowerCase().includes('film')) {
          pageTitle = result.title;
          break;
        }
      }

      // If no film-specific result was found, use the first result
      if (!pageTitle && searchData.query.search.length > 0) {
        pageTitle = searchData.query.search[0].title;
      }

      if (!pageTitle) {
        return null;
      }

      // Get the page content
      const contentUrl = `${this.baseUrl}/page/summary/${encodeURIComponent(pageTitle)}`;
      const contentResponse = await fetch(contentUrl);
      
      if (!contentResponse.ok) {
        throw new Error(`Wikipedia API content returned ${contentResponse.status}`);
      }

      const pageData = await contentResponse.json();
      
      return this.normalizeMovie(pageData);
    } catch (error) {
      console.error('Error searching Wikipedia by title:', error);
      return null;
    }
  }

  async searchById(id, idType = 'wiki') {
    // Not directly supported for Wikipedia
    return null;
  }

  normalizeMovie(rawData) {
    // Generate an ID from the title
    const titleSlug = rawData.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const id = `wiki_${titleSlug}`;
    
    // Try to extract the year from the title (often in parentheses)
    const yearMatch = rawData.title.match(/\((\d{4})(?: film)?\)/);
    const year = yearMatch ? parseInt(yearMatch[1]) : null;
    
    // Clean up the title by removing year and "film" markers
    const title = rawData.title.replace(/\s*\(\d{4}(?: film)?\)/, '');

    // Extract director using a simple regex if possible
    let director = 'Unknown';
    if (rawData.extract) {
      const directorMatch = rawData.extract.match(/(?:directed|director)[^\n.]*?by\s+([^.,\n]+)/i);
      if (directorMatch) {
        director = directorMatch[1].trim();
      }
    }

    return {
      id,
      title,
      originalTitle: title,
      year,
      director,
      actors: [],  // Would need more complex parsing
      genre: [],   // Would need more complex parsing
      plot: rawData.extract ? rawData.extract.substring(0, 500) : '',
      poster: rawData.thumbnail ? rawData.thumbnail.source : null,
      imdbRating: null,
      imdbID: null,
      tmdbID: null,
      source: 'wikipedia',
      rawData: {
        title: rawData.title,
        url: rawData.content_urls ? rawData.content_urls.desktop.page : null
      }
    };
  }
}

/**
 * Movie Source Factory to create the appropriate data source
 */
class MovieSourceFactory {
  static createDataSource(source, apiKey) {
    switch (source.toLowerCase()) {
      case 'omdb':
        return apiKey ? new OMDBDataSource(apiKey) : new WikipediaDataSource();
      case 'tmdb':
        return apiKey ? new TMDBDataSource(apiKey) : new WikipediaDataSource();
      case 'wikipedia':
        return new WikipediaDataSource();
      default:
        throw new Error(`Unsupported movie data source: ${source}`);
    }
  }

  /**
   * Creates a cascade of data sources with fallback options
   * @param {Object} config - Configuration for data sources
   * @returns {Object} An object with primary and fallback data sources
   */
  static createDataSourceCascade(config) {
    const sources = {
      primary: null,
      fallbacks: []
    };

    // Set up primary data source
    if (config.dataSource.type === 'tmdb' && config.dataSource.apiKey) {
      sources.primary = this.createDataSource('tmdb', config.dataSource.apiKey);
    } else if (config.dataSource.type === 'omdb' && config.dataSource.apiKey) {
      sources.primary = this.createDataSource('omdb', config.dataSource.apiKey);
    } else if (config.dataSource.type === 'fallback') {
      // In fallback mode, try to use sources in priority order
      if (config.dataSource.apiKey) {
        sources.primary = this.createDataSource(config.dataSource.type, config.dataSource.apiKey);
      } else if (config.dataSource.fallback && config.dataSource.fallback.apiKey) {
        sources.primary = this.createDataSource(
          config.dataSource.fallback.type, 
          config.dataSource.fallback.apiKey
        );
      }
    }

    // Set up fallback sources
    if (config.dataSource.fallback) {
      if (config.dataSource.type !== config.dataSource.fallback.type) {
        sources.fallbacks.push(
          this.createDataSource(config.dataSource.fallback.type, config.dataSource.fallback.apiKey)
        );
      }
    }

    // Add Wikipedia as last resort fallback
    sources.fallbacks.push(this.createDataSource('wikipedia'));

    // If no primary source, use Wikipedia
    if (!sources.primary) {
      sources.primary = this.createDataSource('wikipedia');
      console.warn('No movie API keys available. Using Wikipedia as primary source.');
    }

    return sources;
  }
}

export { MovieDataSource, OMDBDataSource, TMDBDataSource, WikipediaDataSource, MovieSourceFactory }; 