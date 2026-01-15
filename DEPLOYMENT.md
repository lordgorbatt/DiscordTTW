# Deployment Guide

## Railway Deployment (Recommended)

### Step 1: Connect Repository
1. Go to [railway.app](https://railway.app)
2. Sign in with your GitHub account
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `DiscordTTW` repository

### Step 2: Configure Environment Variables
In Railway dashboard, go to your project → **Variables** tab, add:

```
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
STEAM_WEB_API_KEY=your_steam_api_key_here (optional)
ALLOWED_CHANNELS=channel_id_1,channel_id_2 (optional, leave empty for all channels)
STEAM_CACHE_DB=/tmp/steam_cache.db (optional, Railway will handle this)
```

### Step 3: Configure Build Settings
Railway should auto-detect Node.js, but verify:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Step 4: Deploy
Railway will automatically:
- Install dependencies
- Build the TypeScript code
- Start the bot
- Keep it running 24/7

**Note**: The first deployment may take 2-3 minutes. Check the **Deployments** tab for logs.

---

## Render Deployment (Alternative)

### Step 1: Create Web Service
1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click **"New"** → **"Web Service"**
4. Connect your `DiscordTTW` repository

### Step 2: Configure Service
- **Name**: `discordttw` (or any name)
- **Environment**: `Node`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: (leave empty)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Step 3: Add Environment Variables
In the **Environment** section, add:

```
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
STEAM_WEB_API_KEY=your_steam_api_key_here
ALLOWED_CHANNELS=
STEAM_CACHE_DB=/tmp/steam_cache.db
```

### Step 4: Deploy
Click **"Create Web Service"** and wait for deployment.

**Note**: Free tier on Render spins down after 15 minutes of inactivity. Consider Railway for 24/7 uptime.

---

## Post-Deployment Checklist

✅ Bot is online and connected to Discord
✅ Check logs for "Ready! Logged in as..." message
✅ Test by uploading a `.twmods` file in Discord
✅ Verify pagination buttons work
✅ Test export functionality

---

## Troubleshooting

### Bot not responding
- Check Railway/Render logs for errors
- Verify `DISCORD_TOKEN` is correct
- Ensure bot has proper permissions in Discord server

### Database errors
- Railway/Render will create the database automatically
- Check file permissions if using custom path

### Steam API errors
- API key is optional but recommended
- Check rate limits if seeing many errors
- Cache will help reduce API calls

### Build failures
- Ensure Node.js 20+ is available
- Check that all dependencies are in `package.json`
- Review build logs for specific errors
