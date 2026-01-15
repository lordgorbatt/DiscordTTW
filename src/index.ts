import dotenv from 'dotenv';
import { SteamCache } from './steam/cache.js';
import { createDiscordClient } from './discord/client.js';

// Load environment variables
dotenv.config();

// Initialize Steam cache
const steamCache = new SteamCache(process.env.STEAM_CACHE_DB || './steam_cache.db');

// Parse allowed channels (optional)
const allowedChannels = process.env.ALLOWED_CHANNELS
  ? process.env.ALLOWED_CHANNELS.split(',').map(id => id.trim()).filter(Boolean)
  : undefined;

// Create and start Discord client
const client = createDiscordClient(steamCache, allowedChannels);

// Log in to Discord
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('DISCORD_TOKEN is not set in environment variables!');
  process.exit(1);
}

client.login(token);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  steamCache.close();
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  steamCache.close();
  client.destroy();
  process.exit(0);
});
