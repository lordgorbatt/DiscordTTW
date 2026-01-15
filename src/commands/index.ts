import { ping } from './ping.js';
import { help } from './help.js';
import type { Command } from '../types/Command.js';

// Export all command data for slash command registration
export const commandsData = [
  ping.data,
  help.data,
];

// Export all commands for the command handler
export const commands: Command[] = [
  ping.command,
  help.command,
];

// Command map for quick lookup
export const commandsMap = new Map<string, Command>(
  commands.map(cmd => [cmd.name, cmd])
);
