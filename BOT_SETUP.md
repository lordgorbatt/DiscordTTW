# Bot Setup Guide - Fixing "Bot Not in Channel" Issue

## Step 1: Enable Message Content Intent

**CRITICAL**: The bot needs the "Message Content Intent" enabled to read message attachments.

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application (TTWMOD)
3. Go to **Bot** section (left sidebar)
4. Scroll down to **Privileged Gateway Intents**
5. **Enable** the following:
   - ✅ **MESSAGE CONTENT INTENT** (Required!)
   - ✅ **SERVER MEMBERS INTENT** (Optional, but recommended)

6. **Save Changes**

## Step 2: Re-invite Bot with Correct Permissions

The bot needs these permissions to work:

### Required Permissions:
- ✅ **Read Messages/View Channels**
- ✅ **Send Messages**
- ✅ **Attach Files** (for CSV/JSON exports)
- ✅ **Read Message History**
- ✅ **Use External Emojis** (for pagination buttons)

### Invite URL Generator:

Go to: **OAuth2** → **URL Generator** in Discord Developer Portal

Select scopes:
- ✅ `bot`
- ✅ `applications.commands` (optional, for future commands)

Select bot permissions:
- ✅ Read Messages/View Channels
- ✅ Send Messages
- ✅ Attach Files
- ✅ Read Message History
- ✅ Use External Emojis

Copy the generated URL and open it in your browser to invite the bot.

## Step 3: Verify Bot Permissions in Server

1. Go to your Discord server
2. Right-click the server name → **Server Settings**
3. Go to **Integrations** → **Bots and Apps**
4. Find **TTWMOD** and click on it
5. Verify it has the permissions listed above

## Step 4: Check Channel Permissions

1. Go to the channel where you want to use the bot
2. Right-click channel → **Edit Channel**
3. Go to **Permissions** tab
4. Find **TTWMOD** in the list
5. Ensure it has:
   - ✅ View Channel
   - ✅ Send Messages
   - ✅ Attach Files
   - ✅ Read Message History

## Step 5: Restart Bot (if needed)

After enabling Message Content Intent, you may need to restart the bot:

1. Go to Railway dashboard
2. Find your deployment
3. Click **Redeploy** or restart the service
4. Check logs to confirm: `Ready! Logged in as TTWMOD#1218`

## Testing

After setup, test by:
1. Uploading a `.twmods` file attachment in Discord
2. The bot should respond with "📥 Processing `.twmods` files..."

## Troubleshooting

### Bot still not responding?

1. **Check Railway logs** - Look for errors
2. **Verify Message Content Intent** - This is the #1 cause of issues
3. **Check ALLOWED_CHANNELS** - If set in Railway, make sure your channel ID is included
4. **Verify bot is online** - Check member list, bot should show as online

### Common Issues:

- **"Bot doesn't see messages"** → Message Content Intent not enabled
- **"Bot can't send messages"** → Missing Send Messages permission
- **"Bot can't attach files"** → Missing Attach Files permission
