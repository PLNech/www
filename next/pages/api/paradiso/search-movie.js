import { createDefaultMovieService } from './lib/movie-service';

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      const { title } = req.query;
  
      // Validate required parameters
      if (!title) {
        return res.status(400).json({ error: 'Missing title parameter' });
      }
  
      // Create movie service instance
      const movieService = createDefaultMovieService();
  
      // Search for the movie
      const movieData = await movieService.searchMovie(title);
      
      if (!movieData) {
        return res.status(404).json({ error: 'Movie not found' });
      }
  
      // Return the movie data
      return res.status(200).json(movieData);
    } catch (error) {
      console.error('Error searching for movie:', error);
      return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }