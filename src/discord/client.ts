import { Client, Events, GatewayIntentBits } from 'discord.js';
import { handleTwmodsMessage } from './handlers/messageTwmods.js';
import { SteamCache } from '../steam/cache.js';
import { handlePaginationInteraction, getSession } from './ui/pagination.js';
import { generateCSV } from '../export/csv.js';
import { generateJSON } from '../export/json.js';
import { AttachmentBuilder } from 'discord.js';

export function createDiscordClient(steamCache: SteamCache, allowedChannels?: string[]): Client {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  });

  // Handle .twmods file attachments
  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    await handleTwmodsMessage(message, steamCache, allowedChannels);
  });

  // Handle pagination button interactions
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    const session = getSession(interaction.message.id);
    if (!session) {
      await interaction.reply({
        content: '❌ This pagination session has expired.',
        ephemeral: true,
      });
      return;
    }

    if (session.userId !== interaction.user.id) {
      await interaction.reply({
        content: '❌ Only the person who uploaded the files can navigate pages.',
        ephemeral: true,
      });
      return;
    }

    const customId = interaction.customId;
    
    if (customId === 'pagination_export') {
      // Export button was clicked
      const csvContent = generateCSV(session.rows, session.fileNames);
      const jsonContent = generateJSON(session.rows);

      const csvAttachment = new AttachmentBuilder(Buffer.from(csvContent, 'utf-8'), {
        name: 'comparison_table_full.csv',
      });

      const jsonAttachment = new AttachmentBuilder(Buffer.from(jsonContent, 'utf-8'), {
        name: 'comparison_table_full.json',
      });

      await interaction.reply({
        content: '📎 **Export Files**',
        files: [csvAttachment, jsonAttachment],
        ephemeral: true,
      });
      return;
    }

    await handlePaginationInteraction(interaction, session);
  });

  return client;
}
