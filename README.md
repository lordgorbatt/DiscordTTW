# DiscordTTW Bot

A Discord bot built with TypeScript and Discord.js.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your Discord bot token:
   ```
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   ```

3. Run the bot:
   ```bash
   npm run dev
   ```

## Deployment

### Option 1: Railway (Recommended - Free tier available)

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account and select this repository
4. Add environment variables:
   - `DISCORD_TOKEN` = your bot token
   - `CLIENT_ID` = your Discord application client ID
5. Railway will automatically detect Node.js and deploy
6. The bot will stay online 24/7

### Option 2: Render (Free tier available)

1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variables:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
6. Deploy!

### Option 3: Run Locally (For Testing)

Just run:
```bash
npm run dev
```

Keep your computer on and the terminal open.

## Commands

- `/ping` - Replies with Pong!
- `/help` - Shows available commands

## Development

- `npm run dev` - Run in development mode
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm test` - Run tests
