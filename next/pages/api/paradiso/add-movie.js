import { createDefaultMovieService } from './lib/movie-service';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, userToken } = req.body;

    // Validate required parameters
    if (!title || !userToken) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Create movie service instance
    const movieService = createDefaultMovieService();

    // Add the movie
    const movieData = await movieService.addMovie(title, userToken);

    // Return success response
    return res.status(200).json({ success: true, movie: movieData });
  } catch (error) {
    console.error('Error adding movie:', error);
    
    // Return appropriate error messages
    if (error.message === 'Movie not found') {
      return res.status(404).json({ error: 'Movie not found' });
    } else if (error.message === 'Movie already exists') {
      return res.status(400).json({ error: 'Movie already exists' });
    }
    
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}