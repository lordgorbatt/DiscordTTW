import { ChatInputCommandInteraction, Message } from 'discord.js';

export interface Command {
  name: string;
  description: string;
  // For slash commands
  executeSlash?: (interaction: ChatInputCommandInteraction) => Promise<void> | void;
  // For message commands (legacy)
  executeMessage?: (message: Message, args?: string[]) => Promise<void> | void;
}
