# Hosting the Paradiso Discord Bot for Free

This guide explains how to host your Paradiso Discord bot for free using Replit, ensuring it runs 24/7 without any costs.

## What is Replit?

[Replit](https://replit.com) is a browser-based IDE that allows you to write, run, and host code in the cloud. It's perfect for hosting Discord bots because:

1. It offers a free tier with no credit card required
2. It can keep your bot running 24/7 (with some setup)
3. It's easy to use and doesn't require server management

## Step 1: Create a Replit Account

1. Go to [Replit](https://replit.com)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create a New Repl

1. Click the "+ Create" button
2. Select "Python" as the template
3. Name your repl "ParadisoBot" or something similar
4. Click "Create Repl"

## Step 3: Set Up Your Bot Files

1. Upload the `paradiso_bot.py` file to your Repl
2. Create a new file called `keep_alive.py` with the following code:

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

3. Modify the end of your `paradiso_bot.py` file to use the keep_alive function:

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

## Step 4: Set Up Environment Variables

Replit provides a secure way to store sensitive information like API keys.

1. In your Repl, click on the 🔒 icon in the sidebar (or find "Secrets" in the "Tools" menu)
2. Add the following secrets:
   - Key: `DISCORD_TOKEN`, Value: `your-discord-bot-token`
   - Key: `ALGOLIA_APP_ID`, Value: `your-algolia-app-id`
   - Key: `ALGOLIA_API_KEY`, Value: `your-algolia-api-key`
   - Key: `ALGOLIA_MOVIES_INDEX`, Value: `paradiso_movies`
   - Key: `ALGOLIA_VOTES_INDEX`, Value: `paradiso_votes`
   - Key: `OMDB_API_KEY`, Value: `your-omdb-api-key`

## Step 5: Install Dependencies

1. Create a new file called `pyproject.toml` with the following content:

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

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"
```

2. Replit will automatically install the dependencies when you run the bot

## Step 6: Run Your Bot

1. Click the "Run" button at the top of the page
2. Your bot should start up and connect to Discord
3. You'll see a webview showing "Paradiso Bot is alive!"

## Step 7: Keep Your Bot Running 24/7

By default, Replit will stop your bot after some time of inactivity. To keep it running:

1. Go to [UptimeRobot](https://uptimerobot.com/)
2. Create a free account
3. Click "Add New Monitor"
4. Select "HTTP(s)" as the monitor type
5. Enter a friendly name like "Paradiso Bot"
6. Enter the URL of your Repl webview (e.g., `https://paradisobot.yourusername.repl.co`)
7. Set the monitoring interval to 5 minutes
8. Click "Create Monitor"

UptimeRobot will now ping your bot every 5 minutes, keeping it alive 24/7.

## Step 8: Update Your Bot

To update your bot when you make changes:

1. Make changes to the files in your Repl
2. Click the "Stop" button if your bot is running
3. Click the "Run" button to restart your bot with the changes

## Alternative Free Hosting Options

If you prefer not to use Replit, here are some alternatives:

### Railway

[Railway](https://railway.app/) offers a generous free tier:
- 5 projects
- 500 hours of runtime per month
- 1GB memory per container

### Render

[Render](https://render.com/) offers a free tier for web services:
- Free for web services (sleeps after 15 minutes of inactivity)
- Wakes up when receiving a request

### Oracle Cloud Free Tier

[Oracle Cloud](https://www.oracle.com/cloud/free/) offers always-free services:
- 2 AMD-based Compute VMs
- 4 ARM-based Ampere A1 cores and 24 GB memory
- 200 GB of storage

## Troubleshooting

- **Bot crashes or doesn't respond**: Check the console output in Replit for error messages
- **UptimeRobot says the site is down**: Make sure your Flask app is running on port 8080
- **Bot doesn't respond to commands**: Ensure your bot has the correct permissions in your Discord server
- **Algolia operations fail**: Check that your API keys and indices are correctly configured

## Notes

- Replit's free tier may occasionally experience slowdowns during high-traffic periods
- The bot might briefly go offline when Replit performs maintenance updates
- For a more robust solution, consider upgrading to Replit's paid plan or hosting on a VPS

## Additional Resources

- [Replit Documentation](https://docs.replit.com/)
- [Discord.py Documentation](https://discordpy.readthedocs.io/)
- [UptimeRobot Documentation](https://uptimerobot.com/help/)