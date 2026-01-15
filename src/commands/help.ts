import { ChatInputCommandInteraction, Message, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../types/Command.js';
import { commands } from '../commands/index.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Shows a list of available commands');

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const embed = new EmbedBuilder()
    .setTitle('Available Commands')
    .setColor(0x5865F2)
    .setDescription('Here are all the commands you can use:')
    .addFields(
      commands.map(cmd => ({
        name: `/${cmd.name}`,
        value: cmd.description || 'No description',
        inline: true,
      }))
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
};

export const executeMessage = async (message: Message, args: string[]) => {
  const embed = new EmbedBuilder()
    .setTitle('Available Commands')
    .setColor(0x5865F2)
    .setDescription('Here are all the commands you can use:')
    .addFields(
      commands.map(cmd => ({
        name: cmd.name,
        value: cmd.description || 'No description',
        inline: true,
      }))
    )
    .setTimestamp();

  await message.reply({ embeds: [embed] });
};

export const command: Command = {
  name: 'help',
  description: 'Shows a list of available commands',
  executeSlash: execute,
  executeMessage: executeMessage,
};
