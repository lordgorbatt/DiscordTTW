import { data as pingData, command as pingCommand } from './ping.js';
import { data as helpData, command as helpCommand } from './help.js';
import type { Command } from '../types/Command.js';

// Export all command data for slash command registration
export const commandsData = [
  pingData,
  helpData,
];

// Export all commands for the command handler
export const commands: Command[] = [
  pingCommand,
  helpCommand,
];

// Command map for quick lookup
export const commandsMap = new Map<string, Command>(
  commands.map(cmd => [cmd.name, cmd])
);
