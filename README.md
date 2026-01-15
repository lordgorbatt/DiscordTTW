# DiscordTTW - Total War: Warhammer 3 Mod Comparison Bot

A production-ready Discord bot that compares Total War: Warhammer 3 mod profile files (`.twmods`) and provides enriched comparison tables using the Steam Web API.

## Features

- 📥 **Automatic File Processing**: Detects `.twmods` file attachments in Discord messages
- 🔍 **Steam Workshop Enrichment**: Fetches mod details from Steam Workshop API
- 📊 **Comparison Tables**: Generates alphabetical comparison tables for multiple mod profiles
- 📄 **Pagination**: Navigate large comparison tables with Discord buttons
- 📎 **Export**: Download full results as CSV or JSON
- 💾 **Smart Caching**: SQLite-based caching for Steam API responses with TTL
- 🏷️ **Type Classification**: Automatically categorizes mods (Overhaul, Campaign, Battle, Graphical, UI, etc.)

## Setup

### Prerequisites

- Node.js 20 or higher
- A Discord bot token ([Discord Developer Portal](https://discord.com/developers/applications))
- (Optional) Steam Web API key (not required, but recommended for higher rate limits)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lordgorbatt/DiscordTTW.git
   cd DiscordTTW
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   DISCORD_TOKEN=your_discord_bot_token_here
   DISCORD_CLIENT_ID=your_client_id_here
   STEAM_WEB_API_KEY=your_steam_api_key_here
   ALLOWED_CHANNELS=channel_id_1,channel_id_2
   STEAM_CACHE_DB=./steam_cache.db
   ```

   **Environment Variables:**
   - `DISCORD_TOKEN` (required): Your Discord bot token
   - `DISCORD_CLIENT_ID` (optional): Your Discord application client ID
   - `STEAM_WEB_API_KEY` (optional): Steam Web API key for higher rate limits
   - `ALLOWED_CHANNELS` (optional): Comma-separated list of channel IDs where the bot should respond. If empty, responds in all channels.
   - `STEAM_CACHE_DB` (optional): Path to SQLite cache database (default: `./steam_cache.db`)

4. Run the bot:
   ```bash
   npm run dev
   ```

## Usage

### Uploading Mod Profiles

Simply upload one or more `.twmods` files as attachments in a Discord message. The bot will:

1. Download and parse the files
2. Extract mod information (workshop IDs, pack filenames, etc.)
3. Fetch Steam Workshop details (with caching)
4. Generate a comparison table
5. Reply with paginated results and export files

### Single File

When uploading a single `.twmods` file, the bot will:
- List all mods found (alphabetically)
- Show Steam Workshop enrichment (title, tags, type)
- Provide export files (CSV/JSON)

### Multiple Files

When uploading 2+ `.twmods` files, the bot will:
- Compare all files
- Show which mods are present in each file (✅/❌)
- Display summary statistics (shared mods, unique per file)
- Generate comparison table with pagination

### Pagination Controls

- **⏮ First**: Jump to first page
- **◀ Prev**: Previous page
- **▶ Next**: Next page
- **⏭ Last**: Jump to last page
- **📎 Export**: Download full CSV/JSON files

**Note**: Only the person who uploaded the files can navigate pages. Sessions expire after 10 minutes.

## File Format

The bot expects `.twmods` files with the following format:

```
mod_lookup_key://<hash>@steam_workshop:<app_id>/<workshop_id>@<timestamp>/<pack_filename>.pack
```

Example:
```
mod_lookup_key://abc123@steam_workshop:1142710/123456789@1699123456/my_mod.pack
```

- Blank lines and lines starting with `#` are ignored
- Malformed lines are counted as parse issues but processing continues

## Mod Type Classification

Mods are automatically categorized based on Steam Workshop tags:

1. **Overhaul** - If tag includes "Overhaul" (with optional Campaign/Battle subcategories)
2. **Graphical** - If tag includes "Graphics", "Visual", or "Reskin"
3. **Campaign** - If tag includes "Campaign", "Immortal Empires", or "Startpos"
4. **Battle** - If tag includes "Battle", "Units", or "Combat"
5. **UI** - If tag includes "UI"
6. **Unknown (Workshop)** - Default for uncategorized mods

## Development

### Scripts

- `npm run dev` - Run in development mode with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm test` - Run unit tests

### Project Structure

```
src/
├── index.ts                 # Main entry point
├── discord/
│   ├── client.ts           # Discord client setup
│   ├── handlers/
│   │   └── messageTwmods.ts # .twmods file handler
│   └── ui/
│       └── pagination.ts   # Pagination UI logic
├── parsers/
│   └── twmods.ts           # .twmods file parser
├── steam/
│   ├── api.ts              # Steam Web API client
│   └── cache.ts            # SQLite caching
├── domain/
│   └── compare.ts          # Comparison logic
├── render/
│   └── table.ts            # Table rendering
└── export/
    ├── csv.ts              # CSV export
    └── json.ts             # JSON export
tests/
├── twmods.parser.test.ts   # Parser unit tests
└── deriveType.test.ts     # Type derivation tests
```

## Deployment

### Railway (Recommended)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create a new project from GitHub
4. Add environment variables in Railway dashboard
5. Deploy automatically on push

### Render

1. Connect your GitHub repository
2. Create a new Web Service
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy!

## Testing

Run the test suite:

```bash
npm test
```

Tests cover:
- `.twmods` file parsing
- Mod type derivation from Steam tags
- Error handling for malformed lines

## Steam API Caching

The bot uses SQLite to cache Steam Workshop data with intelligent TTL:

- **Recent mods** (updated < 7 days ago): Cache for 12 hours
- **Older mods** (updated ≥ 7 days ago): Cache for 7 days

This reduces API calls and improves response times.

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
