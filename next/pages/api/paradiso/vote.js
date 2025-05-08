import { createDefaultMovieService } from './lib/movie-service';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { movieId, userToken } = req.body;

    // Validate required parameters
    if (!movieId || !userToken) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Create movie service instance
    const movieService = createDefaultMovieService();

    // Vote for the movie
    const success = await movieService.voteForMovie(movieId, userToken);

    if (!success) {
      return res.status(400).json({ error: 'User already voted for this movie' });
    }

    // Return success response
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error voting for movie:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}