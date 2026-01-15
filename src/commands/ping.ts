import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/Command.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

export const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.reply('Pong!');
};

// Legacy message command support
export const executeMessage = async (message: Message) => {
  await message.reply('Pong!');
};

export const command: Command = {
  name: 'ping',
  description: 'Replies with Pong!',
  executeSlash: execute,
  executeMessage: executeMessage,
};
