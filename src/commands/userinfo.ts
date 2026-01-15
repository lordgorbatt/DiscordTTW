import { ChatInputCommandInteraction, Message, SlashCommandBuilder, EmbedBuilder, User } from 'discord.js';
import type { Command } from '../types/Command.js';

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Get information about a user')
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to get information about')
      .setRequired(false)
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser('user') || interaction.user;
  const member = interaction.guild?.members.cache.get(user.id);

  const embed = new EmbedBuilder()
    .setTitle(`User Info: ${user.tag}`)
    .setThumbnail(user.displayAvatarURL())
    .setColor(0x5865F2)
    .addFields(
      { name: 'Username', value: user.username, inline: true },
      { name: 'Discriminator', value: user.discriminator, inline: true },
      { name: 'User ID', value: user.id, inline: true },
      { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
    )
    .setTimestamp();

  if (member) {
    embed.addFields(
      { name: 'Nickname', value: member.nickname || 'None', inline: true },
      { name: 'Joined Server', value: member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>` : 'Unknown', inline: true },
      { name: 'Roles', value: member.roles.cache.size > 1 ? `${member.roles.cache.size - 1} roles` : 'No roles', inline: true },
    );
  }

  await interaction.reply({ embeds: [embed] });
};

export const executeMessage = async (message: Message, args?: string[]) => {
  let targetUser: User | undefined;

  if (args && args.length > 0 && args[0]) {
    // Try to find user by mention or ID
    const mention = args[0];
    if (mention.startsWith('<@') && mention.endsWith('>')) {
      const userId = mention.slice(2, -1).replace('!', '');
      targetUser = await message.client.users.fetch(userId).catch(() => undefined);
    } else if (mention) {
      targetUser = await message.client.users.fetch(mention).catch(() => undefined);
    }
  }

  const user = targetUser || message.author;
  const member = message.guild?.members.cache.get(user.id);

  const embed = new EmbedBuilder()
    .setTitle(`User Info: ${user.tag}`)
    .setThumbnail(user.displayAvatarURL())
    .setColor(0x5865F2)
    .addFields(
      { name: 'Username', value: user.username, inline: true },
      { name: 'Discriminator', value: user.discriminator, inline: true },
      { name: 'User ID', value: user.id, inline: true },
      { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
    )
    .setTimestamp();

  if (member) {
    embed.addFields(
      { name: 'Nickname', value: member.nickname || 'None', inline: true },
      { name: 'Joined Server', value: member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>` : 'Unknown', inline: true },
      { name: 'Roles', value: member.roles.cache.size > 1 ? `${member.roles.cache.size - 1} roles` : 'No roles', inline: true },
    );
  }

  await message.reply({ embeds: [embed] });
};

export const command: Command = {
  name: 'userinfo',
  description: 'Get information about a user',
  executeSlash: execute,
  executeMessage: executeMessage,
};
