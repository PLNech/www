#!/usr/bin/env python
"""
Paradiso Setup Script

This script sets up Algolia indices for the Paradiso movie voting system and
generates secured API keys for the frontend and Discord bot.

Usage:
    python setup.py --admin-key YOUR_ADMIN_API_KEY --app-id YOUR_APP_ID

Requirements:
    - Python 3.7+
    - algoliasearch package (pip install algoliasearch)
"""

import argparse
import json
import time
import hashlib
import base64
import urllib.parse
import os
from datetime import datetime, timedelta
from algoliasearch.search_client import SearchClient

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Setup Algolia for Paradiso movie voting system')
    parser.add_argument('--admin-key', required=True, help='Algolia Admin API Key')
    parser.add_argument('--app-id', required=True, help='Algolia Application ID')
    parser.add_argument('--movies-file', default='../../data/movies.json', help='Path to movies JSON file')
    parser.add_argument('--actors-file', default='../../data/actors.json', help='Path to actors JSON file')
    parser.add_argument('--use-sample-data', action='store_true', help='Use sample data instead of JSON files')
    return parser.parse_args()

def create_indices(client, index_prefix):
    """Create and configure indices for the movie voting system."""
    # Create main movies index
    movies_index_name = f"{index_prefix}_movies"
    movies_index = client.init_index(movies_index_name)
    
    # Configure movies index settings
    movies_settings = {
        # Searchable attributes (in order of importance)
        "searchableAttributes": [
            "title",
            "originalTitle",
            "director",
            "actors",
            "year",
            "plot"
        ],
        # Attributes for faceting
        "attributesForFaceting": [
            "searchable(genre)",
            "year",
            "voted"
        ],
        # Custom ranking to prioritize more voted movies
        "customRanking": [
            "desc(votes)",
            "desc(year)"
        ],
        # Highlighting and snippeting configuration
        "highlightPreTag": "<em>",
        "highlightPostTag": "</em>",
        # Pagination settings
        "hitsPerPage": 20,
        # Enable typo tolerance
        "minWordSizefor1Typo": 3,
        "minWordSizefor2Typos": 6,
        # Restrict search to specific query parameters
        "queryType": "prefixAll",
        # Advanced settings
        "removeStopWords": True,
        "ignorePlurals": True,
        # Disable A/B testing
        "enablePersonalization": False,
        # Define distinct property
        "distinct": True,
        "attributeForDistinct": "objectID"
    }
    
    # Apply settings to the index
    movies_index.set_settings(movies_settings)
    print(f"✅ Created and configured {movies_index_name} index")
    
    # Create votes index for storing user votes
    votes_index_name = f"{index_prefix}_votes"
    votes_index = client.init_index(votes_index_name)
    
    # Configure votes index settings
    votes_settings = {
        "searchableAttributes": [
            "userToken",
            "movieId"
        ],
        "attributesForFaceting": [
            "userToken",
            "movieId"
        ],
        # Simple ranking based on when the vote was cast
        "customRanking": [
            "desc(timestamp)"
        ],
        "hitsPerPage": 100
    }
    
    # Apply settings to the votes index
    votes_index.set_settings(votes_settings)
    print(f"✅ Created and configured {votes_index_name} index")
    
    # Create actors index
    actors_index_name = f"{index_prefix}_actors"
    actors_index = client.init_index(actors_index_name)
    
    # Configure actors index settings
    actors_settings = {
        "searchableAttributes": [
            "name",
            "alternative_name"
        ],
        "attributesForFaceting": [
            "rating"
        ],
        "customRanking": [
            "desc(rating)"
        ],
        "highlightPreTag": "<em>",
        "highlightPostTag": "</em>",
        "hitsPerPage": 20
    }
    
    # Apply settings to the actors index
    actors_index.set_settings(actors_settings)
    print(f"✅ Created and configured {actors_index_name} index")
    
    # Return the configured index names
    return {
        "movies": movies_index_name,
        "votes": votes_index_name,
        "actors": actors_index_name
    }

def generate_secured_api_key(admin_key, restrictions):
    """
    Generate a secured API key with the given restrictions.
    This is done manually instead of using the client to ensure compatibility.
    """
    # Convert the restrictions to a string
    restrictions_str = json.dumps(restrictions)
    
    # Create the message to sign
    message = admin_key.encode() + restrictions_str.encode()
    
    # Generate the signature
    hash_obj = hashlib.sha256(message).digest()
    
    # Encode the signature in base64
    signature = base64.b64encode(hash_obj).decode()
    
    # URL encode the restrictions for the key
    url_encoded_restrictions = urllib.parse.quote(restrictions_str)
    
    # Create the secured API key
    secured_key = signature + url_encoded_restrictions
    
    return secured_key

# DOCS EXAMPLE
# Create new API Key with specific restrictions
#
# Copy

# # Create a new restricted search-only API key
# params = {
#     'description': 'Restricted search-only API key for algolia.com',
#     # Allow searching only in indices with names starting with `dev_*`
#     'indexes': ['dev_*'],
#     # Retrieve up to 20 results per search query
#     'maxHitsPerQuery': 20,
#     # Rate-limit to 100 requests per hour per IP address
#     'maxQueriesPerIPPerHour': 100,
#     # Add fixed query parameters to every search request
#     'queryParameters': 'ignorePlurals=false',
#     # Only allow searches from the `algolia.com` domain
#     'referers': ['algolia.com/*'],
#     # This API key expires after 300 seconds (5 minutes)
#     'validity': 300,
# }

# acl = ['search']
# res = client.add_api_key(acl, params)
# print(res["key"])

# CURRENT ERROR 
# Params: {'description': 'Paradiso search-only API key', 'acl': ['search'], 'indexes': ['paradiso_movies', 'paradiso_votes', 'paradiso_actors'], 'maxQueriesPerIPPerHour': 100, 'maxHitsPerQuery': 50, 'validity': 0}
# Traceback (most recent call last):
#   File "/home/pln/Work/Web/www/next/pages/paradiso/setup.py", line 496, in <module>
#     main()
#   File "/home/pln/Work/Web/www/next/pages/paradiso/setup.py", line 461, in main
#     keys = create_api_keys(client, indices)
#   File "/home/pln/Work/Web/www/next/pages/paradiso/setup.py", line 182, in create_api_keys
#     search_key = client.add_api_key(search_key_params)
#   File "/home/pln/.virtualenvs/paradiso/lib/python3.10/site-packages/algoliasearch/search_client.py", line 238, in add_api_key
#     raw_response = self._transporter.write(
#   File "/home/pln/.virtualenvs/paradiso/lib/python3.10/site-packages/algoliasearch/http/transporter.py", line 35, in write
#     return self.request(verb, hosts, path, data, request_options, timeout)
#   File "/home/pln/.virtualenvs/paradiso/lib/python3.10/site-packages/algoliasearch/http/transporter.py", line 72, in request
#     return self.retry(hosts, request, relative_url)
#   File "/home/pln/.virtualenvs/paradiso/lib/python3.10/site-packages/algoliasearch/http/transporter.py", line 91, in retry
#     raise RequestException(content, response.status_code)
# algoliasearch.exceptions.RequestException: Expecting an array (near 1:10)


def create_api_keys(client, indices):
    """Create and configure API keys for the movie voting system."""
    # Create a search-only API key with rate limiting
    search_key_params = {
        "description": "Paradiso search-only API key",
        "indexes": list(indices.values()),
        "maxQueriesPerIPPerHour": 100,
        "maxHitsPerQuery": 50,
        "validity": 0  # No expiration
    }
    print("Params:", search_key_params)
    search_acl = ["search"]
    search_key = client.add_api_key(search_acl, search_key_params)
    print(f"✅ Created search-only API key: {search_key['key']}")
    
    # Create an API key for frontend with limited permissions
    frontend_key_params = {
        "description": "Paradiso frontend API key",
        "indexes": list(indices.values()),
        "maxQueriesPerIPPerHour": 100,
        "maxHitsPerQuery": 50,
        "validity": 0  # No expiration
    }
    frontend_acl = ["search", "browse", "addObject"]
    frontend_key = client.add_api_key(frontend_acl, frontend_key_params)
    print(f"✅ Created frontend API key: {frontend_key['key']}")
    
    # Create an API key for Discord bot with more permissions
    bot_key_params = {
        "description": "Paradiso Discord bot API key",
        "indexes": list(indices.values()),
        "maxQueriesPerIPPerHour": 1000,
        "maxHitsPerQuery": 100,
        "validity": 0  # No expiration
    }
    bot_acl = ["search", "browse", "addObject", "deleteObject", "settings"]
    bot_key = client.add_api_key(bot_acl, bot_key_params)
    print(f"✅ Created Discord bot API key: {bot_key['key']}")
    
    # Generate secured API keys with different restrictions
    
    # For frontend: limited to movies index with increment operation for votes
    frontend_restrictions = {
        "restrictIndices": [indices["movies"], indices["actors"]],
        # Valid for 1 year (adjust as needed)
        "validUntil": int(time.time() + 365 * 24 * 60 * 60)
    }
    
    frontend_secured_key = generate_secured_api_key(
        frontend_key["key"], 
        frontend_restrictions
    )
    print(f"✅ Generated secured frontend API key")
    
    # For Discord bot: access to both indices
    bot_restrictions = {
        "restrictIndices": list(indices.values()),
        # Valid for 1 year (adjust as needed)
        "validUntil": int(time.time() + 365 * 24 * 60 * 60)
    }
    
    bot_secured_key = generate_secured_api_key(
        bot_key["key"], 
        bot_restrictions
    )
    print(f"✅ Generated secured Discord bot API key")
    
    # Return all the keys
    return {
        "search_key": search_key["key"],
        "frontend_key": frontend_key["key"],
        "frontend_secured_key": frontend_secured_key,
        "bot_key": bot_key["key"],
        "bot_secured_key": bot_secured_key
    }

def add_sample_data(client, indices):
    """Add some sample data to the movies index."""
    movies_index = client.init_index(indices["movies"])
    
    # Sample movies data
    sample_movies = [
        {
            "objectID": "tt0068646",
            "title": "The Godfather",
            "originalTitle": "The Godfather",
            "year": 1972,
            "director": "Francis Ford Coppola",
            "actors": ["Marlon Brando", "Al Pacino", "James Caan"],
            "genre": ["Crime", "Drama"],
            "plot": "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
            "poster": "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
            "votes": 3,
            "addedDate": int(time.time()),
            "addedBy": "setup_script",
            "imdbRating": 9.2,
            "imdbID": "tt0068646",
            "tmdbID": "238"
        },
        {
            "objectID": "tt0111161",
            "title": "The Shawshank Redemption",
            "originalTitle": "The Shawshank Redemption",
            "year": 1994,
            "director": "Frank Darabont",
            "actors": ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
            "genre": ["Drama"],
            "plot": "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
            "poster": "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
            "votes": 5,
            "addedDate": int(time.time()),
            "addedBy": "setup_script",
            "imdbRating": 9.3,
            "imdbID": "tt0111161",
            "tmdbID": "278"
        },
        {
            "objectID": "tt0468569",
            "title": "The Dark Knight",
            "originalTitle": "The Dark Knight",
            "year": 2008,
            "director": "Christopher Nolan",
            "actors": ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
            "genre": ["Action", "Crime", "Drama"],
            "plot": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
            "poster": "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
            "votes": 2,
            "addedDate": int(time.time()),
            "addedBy": "setup_script",
            "imdbRating": 9.0,
            "imdbID": "tt0468569",
            "tmdbID": "155"
        }
    ]
    
    # Add sample movies to the index
    movies_index.save_objects(sample_movies)
    print(f"✅ Added {len(sample_movies)} sample movies to {indices['movies']} index")

def load_from_json_files(client, indices, movies_file, actors_file):
    """Load data from JSON files into Algolia indices."""
    movies_index = client.init_index(indices["movies"])
    actors_index = client.init_index(indices["actors"])
    
    # Load movies data
    try:
        with open(movies_file, 'r', encoding='utf-8') as f:
            movies_data = json.load(f)
        
        # Transform movies data to match our schema
        formatted_movies = []
        for movie in movies_data:
            # Skip movies without required fields
            if not movie.get('title') or not movie.get('id'):
                continue
                
            # Generate a unique objectID
            object_id = movie.get('imdb_id') or f"tmdb_{movie.get('id')}"
            
            # Format the movie data
            formatted_movie = {
                "objectID": object_id,
                "title": movie.get('title', ''),
                "originalTitle": movie.get('original_title', movie.get('title', '')),
                "year": movie.get('release_date', '')[:4] if movie.get('release_date') else None,
                "director": movie.get('director', 'Unknown'),
                "actors": movie.get('actors', []),
                "genre": [genre['name'] for genre in movie.get('genres', [])] if movie.get('genres') else [],
                "plot": movie.get('overview', ''),
                "poster": f"https://image.tmdb.org/t/p/w500{movie.get('poster_path')}" if movie.get('poster_path') else None,
                "votes": 0,
                "addedDate": int(time.time()),
                "addedBy": "setup_script",
                "imdbRating": movie.get('vote_average', 0),
                "imdbID": movie.get('imdb_id', ''),
                "tmdbID": str(movie.get('id', '')),
                "source": "tmdb"
            }
            formatted_movies.append(formatted_movie)
        
        # Save movies in batches to avoid hitting Algolia limits
        batch_size = 1000
        for i in range(0, len(formatted_movies), batch_size):
            batch = formatted_movies[i:i+batch_size]
            movies_index.save_objects(batch)
            print(f"✅ Added batch {i//batch_size + 1}/{(len(formatted_movies) + batch_size - 1)//batch_size} of movies to {indices['movies']} index")
        
        print(f"✅ Added {len(formatted_movies)} movies from {movies_file} to {indices['movies']} index")
    except Exception as e:
        print(f"❌ Error loading movies from {movies_file}: {e}")
    
    # Load actors data
    try:
        with open(actors_file, 'r', encoding='utf-8') as f:
            actors_data = json.load(f)
        
        # Save actors in batches to avoid hitting Algolia limits
        batch_size = 1000
        for i in range(0, len(actors_data), batch_size):
            batch = actors_data[i:i+batch_size]
            actors_index.save_objects(batch)
            print(f"✅ Added batch {i//batch_size + 1}/{(len(actors_data) + batch_size - 1)//batch_size} of actors to {indices['actors']} index")
        
        print(f"✅ Added {len(actors_data)} actors from {actors_file} to {indices['actors']} index")
    except Exception as e:
        print(f"❌ Error loading actors from {actors_file}: {e}")

def save_config(app_id, indices, keys):
    """Save the configuration to a local file."""
    config = {
        "app_id": app_id,
        "indices": indices,
        "keys": keys,
        "created_at": datetime.now().isoformat(),
        "expires_at": (datetime.now() + timedelta(days=365)).isoformat()
    }
    
    # Save to a file
    with open("paradiso_config.json", "w") as f:
        json.dump(config, f, indent=2)
    
    print(f"✅ Saved configuration to paradiso_config.json")
    
    # Also create environment files for frontend and bot
    with open(".env.frontend", "w") as f:
        f.write(f"NEXT_PUBLIC_ALGOLIA_APP_ID={app_id}\n")
        f.write(f"NEXT_PUBLIC_ALGOLIA_SEARCH_KEY={keys['search_key']}\n")
        f.write(f"NEXT_PUBLIC_ALGOLIA_INDEX={indices['movies']}\n")
        f.write(f"NEXT_PUBLIC_ALGOLIA_ACTORS_INDEX={indices['actors']}\n")
        f.write(f"ALGOLIA_SECURED_KEY={keys['frontend_secured_key']}\n")
        f.write(f"OMDB_API_KEY=YOUR_OMDB_API_KEY\n")
        f.write(f"TMDB_API_KEY=YOUR_TMDB_API_KEY\n")
        f.write(f"MOVIE_DATA_SOURCE=tmdb\n")
    
    print(f"✅ Saved frontend environment to .env.frontend")
    
    with open(".env.bot", "w") as f:
        f.write(f"ALGOLIA_APP_ID={app_id}\n")
        f.write(f"ALGOLIA_API_KEY={keys['bot_secured_key']}\n")
        f.write(f"ALGOLIA_MOVIES_INDEX={indices['movies']}\n")
        f.write(f"ALGOLIA_VOTES_INDEX={indices['votes']}\n")
        f.write(f"ALGOLIA_ACTORS_INDEX={indices['actors']}\n")
        f.write(f"DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN\n")
        f.write(f"OMDB_API_KEY=YOUR_OMDB_API_KEY\n")
        f.write(f"TMDB_API_KEY=YOUR_TMDB_API_KEY\n")
        f.write(f"MOVIE_DATA_SOURCE=tmdb\n")
    
    print(f"✅ Saved Discord bot environment to .env.bot")

def get_api_key_instructions():
    """Instructions for obtaining API keys."""
    print("\n== API Key Instructions ==")
    print("For movie data, we're using both TMDB and OMDB APIs with fallback support.")
    
    print("\n=== TMDB API Key ===")
    print("To get a free TMDB API key:")
    print("1. Visit https://www.themoviedb.org/signup")
    print("2. Create an account and verify your email")
    print("3. Go to https://www.themoviedb.org/settings/api")
    print("4. Request an API key for a developer application")
    print("5. Fill out the form and submit")
    print("6. Update the .env.frontend and .env.bot files with your TMDB API key")
    
    print("\n=== OMDB API Key ===")
    print("To get a free OMDB API key:")
    print("1. Visit https://www.omdbapi.com/apikey.aspx")
    print("2. Sign up for a FREE API key (allows up to 1,000 daily requests)")
    print("3. Check your email and activate your key")
    print("4. Update the .env.frontend and .env.bot files with your OMDB API key")
    
    print("\nWhen you get your keys, replace 'YOUR_TMDB_API_KEY' and 'YOUR_OMDB_API_KEY' in the .env files with your actual keys.")

def main():
    """Main setup function."""
    args = parse_args()
    
    print("\n== Paradiso Algolia Setup ==")
    print(f"Setting up Algolia for Paradiso movie voting system...")
    
    # Initialize the Algolia client
    client = SearchClient.create(args.app_id, args.admin_key)
    
    # Create a unique prefix for the indices
    index_prefix = "paradiso"
    
    # Create and configure indices
    indices = create_indices(client, index_prefix)
    
    # Create and configure API keys
    keys = create_api_keys(client, indices)
    
    # Add data
    if args.use_sample_data:
        add_sample_data(client, indices)
    else:
        # Resolve paths relative to the script location
        script_dir = os.path.dirname(os.path.abspath(__file__))
        movies_path = os.path.join(script_dir, args.movies_file)
        actors_path = os.path.join(script_dir, args.actors_file)
        
        print(f"Loading data from JSON files:")
        print(f"- Movies: {movies_path}")
        print(f"- Actors: {actors_path}")
        
        load_from_json_files(client, indices, movies_path, actors_path)
    
    # Save the configuration
    save_config(args.app_id, indices, keys)
    
    # Instructions for API keys
    get_api_key_instructions()
    
    print("\n== Setup Complete ==")
    print("Your Algolia-powered Paradiso movie voting system is now set up!")
    print("Keep paradiso_config.json in a secure location, as it contains your API keys.")
    print("Add the environment variables from .env.frontend to your Next.js project.")
    print("Add the environment variables from .env.bot to your Discord bot project.")
    print("\nNotes:")
    print("- The secured API keys are valid for 1 year. After that, you'll need to generate new ones.")
    print("- Rate limits are set to 100 queries per hour for frontend and 1000 for the bot.")
    print("- TMDB API has a limit of 1,000 requests per day with the free key.")
    print("- OMDB API has a limit of 1,000 requests per day with the free key.")

if __name__ == "__main__":
    main()