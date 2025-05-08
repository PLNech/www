# Paradiso Bot Deployment Guide

This guide will help you deploy the Paradiso movie voting bot on your Debian server or using Replit, as you prefer.

## Environment Variables

The bot requires the following environment variables:

- `DISCORD_TOKEN`: Your Discord bot token
- `ALGOLIA_APP_ID`: Your Algolia application ID
- `ALGOLIA_API_KEY`: Your Algolia API key
- `ALGOLIA_MOVIES_INDEX`: The Algolia index for movies (e.g., `paradiso_movies`)
- `ALGOLIA_VOTES_INDEX`: The Algolia index for votes (e.g., `paradiso_votes`)
- `MOVIE_DATA_SOURCE`: Preferred movie data source (`tmdb`, `omdb`, or `fallback`, defaults to `tmdb`)

At least one of the following API keys is required:
- `TMDB_API_KEY`: Your TMDB API key
- `OMDB_API_KEY`: Your OMDB API key

## Option 1: Deploy on Your Debian Server

### Prerequisites

- Debian 9+ (tested on Debian 9.13 Stretch)
- Python 3.7+ (Python 3.5+ should work, but 3.7+ is recommended)
- pip (Python package manager)
- systemd for service management

### Installation Steps

1. Log in to your server and create a directory for the bot:
   ```bash
   mkdir -p /opt/paradiso-bot
   cd /opt/paradiso-bot
   ```

2. Download the bot files or clone the repository:
   ```bash
   # If you have git installed
   git clone https://your-repo-url.git .
   
   # Or manually download and upload the files
   ```

3. Set up a Python virtual environment (recommended):
   ```bash
   # Install venv if not already installed
   apt-get update
   apt-get install -y python3-venv
   
   # Create and activate virtual environment
   python3 -m venv venv
   source venv/bin/activate
   ```

4. Install the required dependencies:
   ```bash
   pip install discord.py python-dotenv algoliasearch requests
   ```

5. Create a `.env` file:
   ```bash
   nano .env
   ```

6. Add your environment variables to the `.env` file:
   ```
   DISCORD_TOKEN=your_discord_token
   ALGOLIA_APP_ID=your_algolia_app_id
   ALGOLIA_API_KEY=your_algolia_api_key
   ALGOLIA_MOVIES_INDEX=paradiso_movies
   ALGOLIA_VOTES_INDEX=paradiso_votes
   MOVIE_DATA_SOURCE=tmdb
   TMDB_API_KEY=your_tmdb_api_key
   OMDB_API_KEY=your_omdb_api_key
   ```

7. Create a systemd service file:
   ```bash
   sudo nano /etc/systemd/system/paradiso-bot.service
   ```

8. Add the following content to the service file:
   ```
   [Unit]
   Description=Paradiso Discord Bot
   After=network.target
   
   [Service]
   User=your_username
   WorkingDirectory=/opt/paradiso-bot
   ExecStart=/opt/paradiso-bot/venv/bin/python bot.py
   Restart=on-failure
   RestartSec=5
   Environment=PYTHONUNBUFFERED=1
   
   [Install]
   WantedBy=multi-user.target
   ```

9. Enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable paradiso-bot.service
   sudo systemctl start paradiso-bot.service
   ```

10. Check the status of the service:
    ```bash
    sudo systemctl status paradiso-bot.service
    ```

### Changing Your Server Hostname (from erable.plnech.fr to nech.pl)

To change your server hostname on Debian:

1. Edit the hostname file:
   ```bash
   sudo nano /etc/hostname
   ```

2. Replace the current hostname with the new one:
   ```
   nech.pl
   ```

3. Edit the hosts file:
   ```bash
   sudo nano /etc/hosts
   ```

4. Update the relevant line:
   ```
   127.0.1.1       nech.pl
   ```

5. Apply the changes:
   ```bash
   sudo hostname nech.pl
   ```

6. Restart networking and related services:
   ```bash
   sudo systemctl restart networking
   ```

7. If you have configured DNS records, update them by:
   - Logging into your domain registrar or DNS provider
   - Updating the A/AAAA record for `nech.pl` to point to your server's IP
   - If using SSL certificates, you may need to renew them for the new domain

8. Reboot your server to ensure all services are using the new hostname:
   ```bash
   sudo reboot
   ```

## Option 2: Deploy on Replit

### Prerequisites

- A Replit account
- A UptimeRobot account (to keep the bot awake)

### Installation Steps

1. Go to [Replit](https://replit.com) and sign up or log in
2. Click the "+ Create" button
3. Select "Python" as the template
4. Name your repl "ParadisoBot" or similar
5. Click "Create Repl"

6. Upload the `bot.py` file to your Repl

7. Create a `keep_alive.py` file with the following content:

```python
from flask import Flask
from threading import Thread

app = Flask('')

@app.route('/')
def home():
    return "Paradiso Bot is alive!"

def run():
    app.run(host='0.0.0.0', port=8080)

def keep_alive():
    t = Thread(target=run)
    t.start()
```

8. Modify the end of your `bot.py` file to use the keep_alive function:

```python
# At the top of the file, add:
from keep_alive import keep_alive

# At the bottom of your file, replace:
if __name__ == "__main__":
    client.run(DISCORD_TOKEN)

# With:
if __name__ == "__main__":
    keep_alive()  # Keep the bot alive
    client.run(DISCORD_TOKEN)
```

9. Add the environment variables in Replit:
   - Click on the 🔒 icon in the sidebar (or find "Secrets" in the "Tools" menu)
   - Add each of the environment variables listed above

10. Create a `pyproject.toml` file for dependencies:

```toml
[tool.poetry]
name = "paradiso-bot"
version = "0.1.0"
description = "Discord bot for Paradiso movie night voting"
authors = ["Your Name <your.email@example.com>"]

[tool.poetry.dependencies]
python = "^3.8"
discord = "^2.0.0"
python-dotenv = "^0.21.0"
algoliasearch = "^2.6.2"
requests = "^2.28.1"
Flask = "^2.2.2"
wikipedia = "^1.4.0"  # For fallback movie data

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"
```

11. Click the "Run" button to start the bot

12. To keep the bot running 24/7, set up UptimeRobot:
    - Go to [UptimeRobot](https://uptimerobot.com/)
    - Create a free account
    - Click "Add New Monitor"
    - Select "HTTP(s)" as the monitor type
    - Enter a friendly name like "Paradiso Bot"
    - Enter the URL of your Repl webview (e.g., `https://paradisobot.yourusername.repl.co`)
    - Set the monitoring interval to 5 minutes
    - Click "Create Monitor"

## Movie Data Source Configuration

The bot supports multiple movie data sources in a fallback cascade:

1. Configure which API to use as primary with the `MOVIE_DATA_SOURCE` environment variable:
   - `tmdb`: Use The Movie Database API (recommended)
   - `omdb`: Use Open Movie Database API
   - `fallback`: Attempt to use all available sources in priority order

2. The system will work with any of these configurations:
   - TMDB API only: Set `TMDB_API_KEY` and `MOVIE_DATA_SOURCE=tmdb`
   - OMDB API only: Set `OMDB_API_KEY` and `MOVIE_DATA_SOURCE=omdb`
   - Both APIs: Set both keys and choose your preferred order with `MOVIE_DATA_SOURCE`

3. If both APIs fail, the bot will make a best effort to find information using public sources.

## Verifying the Bot is Working

1. Invite the bot to your Discord server using the OAuth2 URL from the Discord Developer Portal
2. Try using the `/help` command in your server to see all available commands
3. Test adding a movie with `/add [movie title]`

## Monitoring and Troubleshooting

### Checking Logs

On your Debian server, you can check the bot logs using:
```bash
sudo journalctl -u paradiso-bot.service
```

For recent logs only:
```bash
sudo journalctl -u paradiso-bot.service -n 50 --no-pager
```

To follow logs in real-time:
```bash
sudo journalctl -u paradiso-bot.service -f
```

### Common Issues

- **Bot not responding to commands**: 
  - Check if the bot is running: `systemctl status paradiso-bot`
  - Verify Discord token is correct
  - Ensure the bot has the proper permissions in Discord

- **Movie search not working**:
  - Check if TMDB/OMDB API keys are correct
  - Look for API rate limiting errors in logs
  - Try switching between data sources

- **Algolia operations failing**:
  - Verify Algolia credentials and index names
  - Check if indices have been properly created
  - Ensure you have the right permissions set for your API key

## Updating the Bot

When you want to update the bot:

1. Stop the current running instance:
   ```bash
   sudo systemctl stop paradiso-bot.service
   ```

2. Update the code files:
   ```bash
   cd /opt/paradiso-bot
   # Pull updates from git or upload new files
   ```

3. Restart the service:
   ```bash
   sudo systemctl start paradiso-bot.service
   ```

## Additional Resources

- [Discord.py Documentation](https://discordpy.readthedocs.io/)
- [Algolia Documentation](https://www.algolia.com/doc/)
- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [OMDB API Documentation](http://www.omdbapi.com/)
- [Debian Service Management](https://wiki.debian.org/systemd)
- [Replit Documentation](https://docs.replit.com/)
- [UptimeRobot Documentation](https://uptimerobot.com/help/) 