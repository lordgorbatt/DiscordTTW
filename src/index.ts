import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { commandsData, commandsMap } from './commands/index.js';

// Load environment variables
dotenv.config();

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);

  // Register slash commands
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID || readyClient.user.id;

  if (!token) {
    console.error('DISCORD_TOKEN is not set in environment variables!');
    return;
  }

  const rest = new REST().setToken(token);

  try {
    console.log(`Started refreshing ${commandsData.length} application (/) commands.`);

    // Register commands globally (takes up to 1 hour to propagate)
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commandsData },
    ) as unknown[];

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});

// Handle slash command interactions
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commandsMap.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    if (command.executeSlash) {
      await command.executeSlash(interaction);
    }
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);
    const reply = {
      content: 'There was an error while executing this command!',
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

// Handle message commands (legacy support)
client.on(Events.MessageCreate, async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Check if message starts with a prefix (you can change this)
  const prefix = '!';
  if (!message.content.startsWith(prefix)) return;

  // Parse command and arguments
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  const command = commandsMap.get(commandName);

  if (!command) return;

  try {
    if (command.executeMessage) {
      await command.executeMessage(message, args);
    }
  } catch (error) {
    console.error(`Error executing message command ${commandName}:`, error);
    await message.reply('There was an error while executing this command!');
  }
});

// Log in to Discord with your client's token
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('DISCORD_TOKEN is not set in environment variables!');
  process.exit(1);
}

client.login(token);
