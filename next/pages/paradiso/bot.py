#!/usr/bin/env python
"""
Paradiso Discord Bot

A Discord bot for the Paradiso movie voting system, using Algolia for data storage.

Requirements:
  - Python 3.7+
  - discord.py
  - python-dotenv
  - algoliasearch
  - requests

Usage:
  1. Install dependencies: pip install discord.py python-dotenv algoliasearch requests
  2. Set up a Discord bot in the Discord Developer Portal
  3. Create a .env file with your Discord bot token and Algolia credentials
  4. Run the bot: python paradiso_bot.py
"""

import os
import json
import random
import logging
import time
import datetime
import abc
from typing import List, Dict, Any, Optional, Union

import discord
from discord import app_commands
from dotenv import load_dotenv
import requests
from algoliasearch.search_client import SearchClient
import re
import urllib.parse
try:
    import wikipedia
    WIKIPEDIA_AVAILABLE = True
except ImportError:
    WIKIPEDIA_AVAILABLE = False
    print("Wikipedia module not installed. Wikipedia fallback won't be available.")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("paradiso_bot.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("paradiso_bot")

# Load environment variables
load_dotenv()
DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')
ALGOLIA_APP_ID = os.getenv('ALGOLIA_APP_ID')
ALGOLIA_API_KEY = os.getenv('ALGOLIA_API_KEY')
ALGOLIA_MOVIES_INDEX = os.getenv('ALGOLIA_MOVIES_INDEX')
ALGOLIA_VOTES_INDEX = os.getenv('ALGOLIA_VOTES_INDEX')
OMDB_API_KEY = os.getenv('OMDB_API_KEY')
TMDB_API_KEY = os.getenv('TMDB_API_KEY')
MOVIE_DATA_SOURCE = os.getenv('MOVIE_DATA_SOURCE', 'tmdb')

# Check if all environment variables are set
if not all([DISCORD_TOKEN, ALGOLIA_APP_ID, ALGOLIA_API_KEY, 
            ALGOLIA_MOVIES_INDEX, ALGOLIA_VOTES_INDEX]):
    logger.error("Missing required environment variables. Please check your .env file.")
    exit(1)

# Movie Data Source Abstraction

class MovieDataSource(abc.ABC):
    """Base movie data source interface."""
    
    @abc.abstractmethod
    async def search_by_title(self, title: str) -> Optional[Dict[str, Any]]:
        """Search for a movie by title."""
        pass
    
    @abc.abstractmethod
    async def search_by_id(self, movie_id: str, id_type: str = 'imdb') -> Optional[Dict[str, Any]]:
        """Search for a movie by ID."""
        pass
    
    @abc.abstractmethod
    def normalize_movie(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize movie data to a consistent format."""
        pass


class OMDBDataSource(MovieDataSource):
    """OMDB API implementation."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "http://www.omdbapi.com/"
    
    async def search_by_title(self, title: str) -> Optional[Dict[str, Any]]:
        """Search for a movie using the OMDb API."""
        try:
            url = f"{self.base_url}?apikey={self.api_key}&t={title}&plot=full"
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            if data.get('Response') == 'False':
                return None
            
            return self.normalize_movie(data)
        except Exception as e:
            logger.error(f"Error searching movie on OMDb: {e}")
            return None
    
    async def search_by_id(self, movie_id: str, id_type: str = 'imdb') -> Optional[Dict[str, Any]]:
        """Search for a movie by ID using the OMDb API."""
        if id_type != 'imdb':
            raise ValueError("OMDB only supports IMDB IDs")
            
        try:
            url = f"{self.base_url}?apikey={self.api_key}&i={movie_id}&plot=full"
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            if data.get('Response') == 'False':
                return None
            
            return self.normalize_movie(data)
        except Exception as e:
            logger.error(f"Error searching movie by ID on OMDb: {e}")
            return None
    
    def normalize_movie(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize OMDB movie data."""
        return {
            "id": raw_data["imdbID"],
            "title": raw_data["Title"],
            "original_title": raw_data["Title"],
            "year": int(raw_data["Year"]) if raw_data.get("Year", "N/A").isdigit() else None,
            "director": raw_data.get("Director", "Unknown"),
            "actors": raw_data.get("Actors", "").split(", ") if raw_data.get("Actors") else [],
            "genre": raw_data.get("Genre", "").split(", ") if raw_data.get("Genre") else [],
            "plot": raw_data.get("Plot", ""),
            "poster": raw_data.get("Poster") if raw_data.get("Poster") != "N/A" else None,
            "imdb_rating": float(raw_data["imdbRating"]) if raw_data.get("imdbRating", "N/A") != "N/A" else None,
            "imdb_id": raw_data["imdbID"],
            "tmdb_id": None,
            "source": "omdb",
            "raw_data": raw_data
        }


class TMDBDataSource(MovieDataSource):
    """TMDB API implementation."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.themoviedb.org/3"
        self.image_base_url = "https://image.tmdb.org/t/p/w500"
    
    async def search_by_title(self, title: str) -> Optional[Dict[str, Any]]:
        """Search for a movie using the TMDB API."""
        try:
            # First search for the movie
            url = f"{self.base_url}/search/movie?api_key={self.api_key}&query={title}&include_adult=false"
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            if not data.get('results') or len(data['results']) == 0:
                return None
            
            # Get the most relevant result
            movie_id = data['results'][0]['id']
            
            # Get detailed info about the movie
            return await self.search_by_id(str(movie_id), 'tmdb')
        except Exception as e:
            logger.error(f"Error searching movie on TMDB: {e}")
            return None
    
    async def search_by_id(self, movie_id: str, id_type: str = 'tmdb') -> Optional[Dict[str, Any]]:
        """Search for a movie by ID using the TMDB API."""
        try:
            tmdb_id = movie_id
            
            # If ID is IMDb ID, first search for TMDB ID
            if id_type == 'imdb':
                find_url = f"{self.base_url}/find/{movie_id}?api_key={self.api_key}&external_source=imdb_id"
                find_response = requests.get(find_url)
                find_response.raise_for_status()
                find_data = find_response.json()
                
                if not find_data.get('movie_results') or len(find_data['movie_results']) == 0:
                    return None
                
                tmdb_id = str(find_data['movie_results'][0]['id'])
            
            # Get detailed movie info
            details_url = f"{self.base_url}/movie/{tmdb_id}?api_key={self.api_key}&append_to_response=credits"
            details_response = requests.get(details_url)
            details_response.raise_for_status()
            movie_data = details_response.json()
            
            return self.normalize_movie(movie_data)
        except Exception as e:
            logger.error(f"Error searching movie by ID on TMDB: {e}")
            return None
    
    def normalize_movie(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize TMDB movie data."""
        # Extract director from credits
        director = "Unknown"
        if raw_data.get('credits') and raw_data['credits'].get('crew'):
            directors = [member['name'] for member in raw_data['credits']['crew'] 
                        if member.get('job') == 'Director']
            director = ", ".join(directors) if directors else "Unknown"
        
        # Extract actors from credits
        actors = []
        if raw_data.get('credits') and raw_data['credits'].get('cast'):
            actors = [actor['name'] for actor in raw_data['credits']['cast'][:5]]
        
        return {
            "id": str(raw_data["id"]),
            "title": raw_data["title"],
            "original_title": raw_data.get("original_title", raw_data["title"]),
            "year": int(raw_data["release_date"][:4]) if raw_data.get("release_date") else None,
            "director": director,
            "actors": actors,
            "genre": [genre['name'] for genre in raw_data.get("genres", [])],
            "plot": raw_data.get("overview", ""),
            "poster": f"{self.image_base_url}{raw_data['poster_path']}" if raw_data.get("poster_path") else None,
            "imdb_rating": float(raw_data["vote_average"]) if raw_data.get("vote_average") else None,
            "imdb_id": raw_data.get("imdb_id"),
            "tmdb_id": str(raw_data["id"]),
            "source": "tmdb",
            "raw_data": raw_data
        }


class WikipediaDataSource(MovieDataSource):
    """Wikipedia fallback implementation."""
    
    def __init__(self):
        self.image_pattern = re.compile(r'https?://.*?\.(?:jpg|jpeg|png|gif)')
    
    async def search_by_title(self, title: str) -> Optional[Dict[str, Any]]:
        """Search for a movie using Wikipedia."""
        if not WIKIPEDIA_AVAILABLE:
            return None
            
        try:
            # Search for the movie with "film" appended to improve results accuracy
            search_query = f"{title} film"
            search_results = wikipedia.search(search_query, results=5)
            
            if not search_results:
                return None
            
            # Try to find the most relevant page
            page_title = None
            for result in search_results:
                if "film" in result.lower() or "movie" in result.lower():
                    page_title = result
                    break
            
            # If no film-specific result was found, use the first result
            if not page_title and search_results:
                page_title = search_results[0]
                
            if not page_title:
                return None
                
            # Get the page content
            page = wikipedia.page(page_title, auto_suggest=False)
            
            # Try to extract basic information
            return self.normalize_movie({
                "title": page.title,
                "content": page.content,
                "summary": page.summary,
                "url": page.url,
                "images": page.images
            })
        except Exception as e:
            logger.error(f"Error searching Wikipedia: {e}")
            return None
    
    async def search_by_id(self, movie_id: str, id_type: str = 'wiki') -> Optional[Dict[str, Any]]:
        """Not directly supported for Wikipedia."""
        return None
    
    def normalize_movie(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract structured movie data from Wikipedia content."""
        # Get a unique ID based on the URL
        url_parts = urllib.parse.urlparse(raw_data["url"])
        path_parts = url_parts.path.split('/')
        wiki_id = path_parts[-1] if path_parts else "unknown"
        
        # Try to extract the year from the title (often in parentheses)
        year_match = re.search(r'\((\d{4})(?: film)?\)', raw_data["title"])
        year = int(year_match.group(1)) if year_match else None
        
        # Clean up the title by removing year and "film" markers
        title = re.sub(r'\s*\(\d{4}(?: film)?\)', '', raw_data["title"])
        
        # Find a suitable image (movie poster if possible)
        poster = None
        for img_url in raw_data.get("images", []):
            if self.image_pattern.search(img_url):
                if 'poster' in img_url.lower():
                    poster = img_url
                    break
        
        # If no poster-specific image was found, use the first image
        if not poster and raw_data.get("images"):
            for img_url in raw_data.get("images", []):
                if self.image_pattern.search(img_url):
                    poster = img_url
                    break
        
        # Try to extract director from content
        director = "Unknown"
        director_match = re.search(r'(?:Directed|Director)[^\n.]*?by\s+([^.,\n]+)', raw_data["content"])
        if director_match:
            director = director_match.group(1).strip()
        
        return {
            "id": f"wiki_{wiki_id}",
            "title": title,
            "original_title": title,
            "year": year,
            "director": director,
            "actors": [],  # Would need more complex parsing
            "genre": [],   # Would need more complex parsing
            "plot": raw_data["summary"][:500] if raw_data.get("summary") else "",
            "poster": poster,
            "imdb_rating": None,
            "imdb_id": None,
            "tmdb_id": None,
            "source": "wikipedia",
            "raw_data": {
                "title": raw_data["title"],
                "url": raw_data["url"]
            }
        }


def create_movie_data_source(source_type: str, api_key: str = None) -> MovieDataSource:
    """Create a movie data source instance."""
    if source_type.lower() == 'omdb':
        if not api_key:
            logger.warning("OMDB API key not provided, using fallback source")
            return WikipediaDataSource() if WIKIPEDIA_AVAILABLE else None
        return OMDBDataSource(api_key)
    elif source_type.lower() == 'tmdb':
        if not api_key:
            logger.warning("TMDB API key not provided, using fallback source")
            return WikipediaDataSource() if WIKIPEDIA_AVAILABLE else None
        return TMDBDataSource(api_key)
    elif source_type.lower() == 'wikipedia':
        return WikipediaDataSource()
    else:
        raise ValueError(f"Unsupported movie data source: {source_type}")


# Initialize movie data sources with improved fallback logic
primary_data_source = None
fallback_data_sources = []

# Set up primary data source
if MOVIE_DATA_SOURCE == 'tmdb' and TMDB_API_KEY:
    primary_data_source = create_movie_data_source('tmdb', TMDB_API_KEY)
elif MOVIE_DATA_SOURCE == 'omdb' and OMDB_API_KEY:
    primary_data_source = create_movie_data_source('omdb', OMDB_API_KEY)
elif MOVIE_DATA_SOURCE == 'fallback':
    # In fallback mode, try to use sources in priority order
    if TMDB_API_KEY:
        primary_data_source = create_movie_data_source('tmdb', TMDB_API_KEY)
    elif OMDB_API_KEY:
        primary_data_source = create_movie_data_source('omdb', OMDB_API_KEY)

# Set up fallback sources
if MOVIE_DATA_SOURCE != 'omdb' and OMDB_API_KEY:
    fallback_data_sources.append(create_movie_data_source('omdb', OMDB_API_KEY))
if MOVIE_DATA_SOURCE != 'tmdb' and TMDB_API_KEY:
    fallback_data_sources.append(create_movie_data_source('tmdb', TMDB_API_KEY))

# Add Wikipedia as last resort fallback
if WIKIPEDIA_AVAILABLE:
    fallback_data_sources.append(create_movie_data_source('wikipedia'))

# Use Wikipedia directly if no API keys are available
if not primary_data_source and WIKIPEDIA_AVAILABLE:
    primary_data_source = create_movie_data_source('wikipedia')
elif not primary_data_source:
    logger.error("No movie data sources available. Bot will not be able to search for movies.")
    primary_data_source = None

# Initialize Algolia client
algolia_client = SearchClient.create(ALGOLIA_APP_ID, ALGOLIA_API_KEY)
movies_index = algolia_client.init_index(ALGOLIA_MOVIES_INDEX)
votes_index = algolia_client.init_index(ALGOLIA_VOTES_INDEX)

# Set up Discord client
intents = discord.Intents.default()
intents.message_content = True
intents.members = True
client = discord.Client(intents=intents)
tree = app_commands.CommandTree(client)

# Helper Functions
def generate_user_token(user_id: str) -> str:
    """Generate a user token for Algolia based on Discord user ID."""
    return f"discord_{user_id}"

async def search_movie(title: str) -> Optional[Dict[str, Any]]:
    """Search for a movie using configured data sources with full fallback cascade."""
    if not primary_data_source:
        logger.error("No movie data sources available")
        return None
        
    # Try primary data source first
    movie_data = await primary_data_source.search_by_title(title)
    
    # Try each fallback source in order until we find a result
    if not movie_data:
        for source in fallback_data_sources:
            movie_data = await source.search_by_title(title)
            if movie_data:
                logger.info(f"Found movie using fallback source: {source.__class__.__name__}")
                break
    
    return movie_data

async def add_movie_to_algolia(movie_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """Add a movie to Algolia index."""
    try:
        # Format the movie data for Algolia
        movie_obj = {
            "objectID": movie_data["id"],
            "title": movie_data["title"],
            "originalTitle": movie_data["original_title"],
            "year": movie_data["year"],
            "director": movie_data["director"],
            "actors": movie_data["actors"],
            "genre": movie_data["genre"],
            "plot": movie_data["plot"],
            "poster": movie_data["poster"],
            "imdbRating": movie_data["imdb_rating"],
            "imdbID": movie_data["imdb_id"],
            "tmdbID": movie_data["tmdb_id"],
            "votes": 0,
            "addedDate": int(time.time()),
            "addedBy": generate_user_token(user_id),
            "source": movie_data["source"]
        }
        
        # Save to Algolia
        movies_index.save_object(movie_obj)
        return movie_obj
    except Exception as e:
        logger.error(f"Error adding movie to Algolia: {e}")
        raise

async def vote_for_movie(movie_id: str, user_id: str) -> bool:
    """Vote for a movie in Algolia."""
    try:
        user_token = generate_user_token(user_id)
        
        # Check if user already voted for this movie
        search_result = votes_index.search("", {
            "filters": f"userToken:{user_token} AND movieId:{movie_id}"
        })
        
        if search_result["nbHits"] > 0:
            return False  # User already voted
        
        # Record the vote
        votes_index.save_object({
            "objectID": f"{user_token}_{movie_id}",
            "userToken": user_token,
            "movieId": movie_id,
            "timestamp": int(time.time())
        })
        
        # Increment the movie's vote count
        movies_index.partial_update_object({
            "objectID": movie_id,
            "votes": {
                "_operation": "Increment",
                "value": 1
            }
        })
        
        return True
    except Exception as e:
        logger.error(f"Error voting for movie: {e}")
        return False

async def get_top_movies(count: int = 5) -> List[Dict[str, Any]]:
    """Get the top voted movies from Algolia."""
    try:
        search_result = movies_index.search("", {
            "filters": "votes > 0",
            "hitsPerPage": count,
            "sortCriteria": ["votes:desc"]
        })
        
        return search_result["hits"]
    except Exception as e:
        logger.error(f"Error getting top movies: {e}")
        return []

async def get_all_movies() -> List[Dict[str, Any]]:
    """Get all movies from Algolia."""
    try:
        search_result = movies_index.search("", {
            "hitsPerPage": 100
        })
        
        return search_result["hits"]
    except Exception as e:
        logger.error(f"Error getting all movies: {e}")
        return []

async def find_movie_by_title(title: str) -> Optional[Dict[str, Any]]:
    """Find a movie by title in Algolia."""
    try:
        search_result = movies_index.search(title, {
            "hitsPerPage": 5
        })
        
        if search_result["nbHits"] == 0:
            return None
        
        # Try to find an exact match
        for hit in search_result["hits"]:
            if hit["title"].lower() == title.lower():
                return hit
        
        # Return the first result if no exact match
        return search_result["hits"][0]
    except Exception as e:
        logger.error(f"Error finding movie by title: {e}")
        return None

async def remove_movie(movie_id: str) -> bool:
    """Remove a movie from Algolia."""
    try:
        # Delete the movie
        movies_index.delete_object(movie_id)
        
        # Delete all votes for this movie
        search_result = votes_index.search("", {
            "filters": f"movieId:{movie_id}",
            "hitsPerPage": 100
        })
        
        if search_result["nbHits"] > 0:
            object_ids = [hit["objectID"] for hit in search_result["hits"]]
            votes_index.delete_objects(object_ids)
        
        return True
    except Exception as e:
        logger.error(f"Error removing movie: {e}")
        return False

# Bot event handlers
@client.event
async def on_ready():
    """Handle bot ready event."""
    logger.info(f'{client.user} has connected to Discord!')
    
    # Sync commands
    await tree.sync()
    logger.info("Commands synced")

# Bot commands
@tree.command(name="movies", description="List all movies in the voting queue")
async def cmd_movies(interaction: discord.Interaction):
    """List all movies in the voting queue."""
    await interaction.response.defer()
    
    try:
        movies = await get_all_movies()
        
        if not movies:
            await interaction.followup.send("No movies have been added yet! Use `/add` to add one.")
            return
        
        # Sort movies by vote count
        movies.sort(key=lambda m: m.get("votes", 0), reverse=True)
        
        # Create an embed
        embed = discord.Embed(
            title="🎬 Paradiso Movie Night Voting",
            description=f"Here are the movies currently in the queue ({len(movies)} total):",
            color=0x03a9f4,
            timestamp=datetime.datetime.now()
        )
        
        # Add each movie to the embed
        for i, movie in enumerate(movies[:10]):  # Limit to top 10
            title = movie.get("title", "Unknown")
            year = f" ({movie.get('year')})" if movie.get("year") else ""
            votes = movie.get("votes", 0)
            
            medal = "🥇" if i == 0 else "🥈" if i == 1 else "🥉" if i == 2 else f"{i+1}."
            
            embed.add_field(
                name=f"{medal} {title}{year} - {votes} votes",
                value=movie.get("plot", "No description available.")[:100] + "..." 
                      if movie.get("plot") and len(movie.get("plot")) > 100 
                      else movie.get("plot", "No description available."),
                inline=False
            )
        
        if len(movies) > 10:
            embed.set_footer(text=f"Showing top 10 out of {len(movies)} movies. Use /movies_page to see more.")
        
        await interaction.followup.send(embed=embed)
    except Exception as e:
        logger.error(f"Error in /movies command: {e}")
        await interaction.followup.send("An error occurred while getting the movies. Please try again.")

@tree.command(name="add", description="Add a movie to the voting queue")
@app_commands.describe(title="Title of the movie to add")
async def cmd_add(interaction: discord.Interaction, title: str):
    """Add a movie to the voting queue."""
    await interaction.response.defer(thinking=True)
    
    try:
        # Search for the movie
        movie_data = await search_movie(title)
        
        if not movie_data:
            await interaction.followup.send(f"❌ Could not find movie: '{title}'. Please check the title and try again.")
            return
        
        # Check if movie already exists in Algolia
        search_result = movies_index.search("", {
            "filters": f"objectID:{movie_data['id']}"
        })
        
        if search_result["nbHits"] > 0:
            await interaction.followup.send(f"❌ '{movie_data['title']}' is already in the voting queue!")
            return
        
        # Add the movie to Algolia
        movie_obj = await add_movie_to_algolia(movie_data, str(interaction.user.id))
        
        # Create embed for movie
        embed = discord.Embed(
            title=f"🎬 Added: {movie_obj['title']} ({movie_obj['year'] if movie_obj['year'] else 'N/A'})",
            description=movie_obj["plot"] if len(movie_obj["plot"]) < 300 else movie_obj["plot"][:297] + "...",
            color=0x00ff00
        )
        
        if movie_obj["director"]:
            embed.add_field(name="Director", value=movie_obj["director"], inline=True)
        
        if movie_obj["actors"]:
            embed.add_field(name="Starring", value=", ".join(movie_obj["actors"][:3]), inline=True)
        
        if movie_obj["imdbRating"]:
            embed.add_field(name="Rating", value=f"⭐ {movie_obj['imdbRating']}/10", inline=True)
        
        if movie_obj["poster"]:
            embed.set_thumbnail(url=movie_obj["poster"])
        
        embed.set_footer(text=f"Added by {interaction.user.display_name} | Source: {movie_obj['source'].upper()}")
        
        await interaction.followup.send(embed=embed)
        
    except Exception as e:
        logger.error(f"Error in add command: {e}")
        await interaction.followup.send(f"❌ An error occurred: {str(e)}")

@tree.command(name="vote", description="Vote for a movie in the queue")
@app_commands.describe(title="Title of the movie to vote for")
async def cmd_vote(interaction: discord.Interaction, title: str):
    """Vote for a movie in the queue."""
    await interaction.response.defer(thinking=True)
    
    try:
        # Find the movie in Algolia
        movie = await find_movie_by_title(title)
        
        if not movie:
            await interaction.followup.send(f"❌ Could not find '{title}' in the voting queue. Use /movies to see available movies.")
            return
        
        # Record the vote
        user_token = generate_user_token(str(interaction.user.id))
        
        # Check if user already voted for this movie
        search_result = votes_index.search("", {
            "filters": f"userToken:{user_token} AND movieId:{movie['objectID']}"
        })
        
        if search_result["nbHits"] > 0:
            await interaction.followup.send(f"❌ You have already voted for '{movie['title']}'!")
            return
        
        # Record the vote
        success = await vote_for_movie(movie["objectID"], str(interaction.user.id))
        
        if not success:
            await interaction.followup.send("❌ Failed to record vote. Please try again.")
            return
        
        # Update movie information
        updated_movie = await movies_index.get_object(movie["objectID"])
        
        # Create embed for vote confirmation
        embed = discord.Embed(
            title=f"✅ Vote recorded for: {updated_movie['title']}",
            description=f"This movie now has {updated_movie['votes']} vote(s)!",
            color=0x00ff00
        )
        
        if updated_movie.get("poster"):
            embed.set_thumbnail(url=updated_movie["poster"])
        
        embed.set_footer(text=f"Voted by {interaction.user.display_name}")
        
        await interaction.followup.send(embed=embed)
        
    except Exception as e:
        logger.error(f"Error in vote command: {e}")
        await interaction.followup.send(f"❌ An error occurred: {str(e)}")

@tree.command(name="remove", description="Remove a movie from the voting queue")
@app_commands.describe(title="Title of the movie to remove")
async def cmd_remove(interaction: discord.Interaction, title: str):
    """Remove a movie from the voting queue."""
    await interaction.response.defer()
    
    try:
        # Check if user has admin privileges
        if not interaction.user.guild_permissions.administrator:
            await interaction.followup.send("You need administrator privileges to remove movies.")
            return
        
        # Find the movie
        movie = await find_movie_by_title(title)
        
        if not movie:
            await interaction.followup.send(f"Movie '{title}' not found in the voting queue.")
            return
        
        # Remove the movie
        success = await remove_movie(movie["objectID"])
        
        if success:
            await interaction.followup.send(f"Removed '{movie['title']}' from the voting queue.")
        else:
            await interaction.followup.send(f"Failed to remove '{movie['title']}'. Please try again.")
    except Exception as e:
        logger.error(f"Error in /remove command: {e}")
        await interaction.followup.send("An error occurred while removing the movie. Please try again.")

@tree.command(name="top", description="Show the top voted movies")
@app_commands.describe(count="Number of top movies to show (default: 5)")
async def cmd_top(interaction: discord.Interaction, count: int = 5):
    """Show the top voted movies."""
    await interaction.response.defer(thinking=True)
    
    try:
        # Limit count to reasonable values
        count = max(1, min(10, count))
        
        # Get top voted movies
        top_movies = await get_top_movies(count)
        
        if not top_movies:
            await interaction.followup.send("❌ No movies have been voted for yet!")
            return
        
        # Create embed for top movies
        embed = discord.Embed(
            title=f"🏆 Top {len(top_movies)} Voted Movies",
            description="Here are the most popular movies for our next movie night!",
            color=0x00ff00
        )
        
        for i, movie in enumerate(top_movies):
            # Get medal emoji for top 3
            medal = "🥇" if i == 0 else "🥈" if i == 1 else "🥉" if i == 2 else f"{i+1}."
            
            # Create field for each movie
            movie_details = [
                f"**Votes**: {movie['votes']}",
                f"**Year**: {movie['year'] if movie.get('year') else 'N/A'}",
                f"**Rating**: ⭐ {movie.get('imdbRating', 'N/A')}/10"
            ]
            
            embed.add_field(
                name=f"{medal} {movie['title']}",
                value="\n".join(movie_details),
                inline=False
            )
        
        # Add instructions on how to vote
        embed.set_footer(text="Use /vote to vote for a movie!")
        
        await interaction.followup.send(embed=embed)
        
    except Exception as e:
        logger.error(f"Error in top command: {e}")
        await interaction.followup.send(f"❌ An error occurred: {str(e)}")

@tree.command(name="random", description="Suggest a random movie from the list")
async def cmd_random(interaction: discord.Interaction):
    """Suggest a random movie from the list."""
    await interaction.response.defer(thinking=True)
    
    try:
        # Get all movies
        movies = await get_all_movies()
        
        if not movies:
            await interaction.followup.send("❌ No movies in the database yet! Add some with /add.")
            return
        
        # Choose a random movie
        random_movie = random.choice(movies)
        
        # Create embed for random movie
        embed = discord.Embed(
            title=f"🎲 Random Movie: {random_movie['title']} ({random_movie['year'] if random_movie.get('year') else 'N/A'})",
            description=random_movie.get("plot", "No plot available.") if len(random_movie.get("plot", "")) < 300 else random_movie.get("plot", "")[:297] + "...",
            color=0x00ff00
        )
        
        if random_movie.get("director"):
            embed.add_field(name="Director", value=random_movie["director"], inline=True)
        
        if random_movie.get("actors") and len(random_movie["actors"]) > 0:
            embed.add_field(name="Starring", value=", ".join(random_movie["actors"][:3]), inline=True)
        
        if random_movie.get("imdbRating"):
            embed.add_field(name="Rating", value=f"⭐ {random_movie['imdbRating']}/10", inline=True)
        
        embed.add_field(name="Votes", value=f"👍 {random_movie.get('votes', 0)}", inline=True)
        
        if random_movie.get("poster"):
            embed.set_thumbnail(url=random_movie["poster"])
        
        embed.set_footer(text=f"Source: {random_movie.get('source', 'unknown').upper()} | Vote with: /vote {random_movie['title']}")
        
        await interaction.followup.send(embed=embed)
        
    except Exception as e:
        logger.error(f"Error in random command: {e}")
        await interaction.followup.send(f"❌ An error occurred: {str(e)}")

@tree.command(name="help", description="Show help for Paradiso commands")
async def cmd_help(interaction: discord.Interaction):
    """Show help for Paradiso commands."""
    embed = discord.Embed(
        title="Paradiso Bot Help",
        description="Here are the commands you can use with the Paradiso movie voting bot:",
        color=0x03a9f4
    )
    
    commands = [
        {
            "name": "/movies",
            "description": "List all movies in the voting queue"
        },
        {
            "name": "/add [title]",
            "description": "Add a movie to the voting queue"
        },
        {
            "name": "/vote [title]",
            "description": "Vote for a movie in the queue"
        },
        {
            "name": "/remove [title]",
            "description": "Remove a movie from the voting queue (admin only)"
        },
        {
            "name": "/top [count]",
            "description": "Show the top voted movies (default: top 5)"
        },
        {
            "name": "/random",
            "description": "Suggest a random movie from the list"
        }
    ]
    
    for cmd in commands:
        embed.add_field(name=cmd["name"], value=cmd["description"], inline=False)
    
    embed.set_footer(text="Happy voting! 🎬")
    
    await interaction.response.send_message(embed=embed)

if __name__ == "__main__":
    client.run(DISCORD_TOKEN)