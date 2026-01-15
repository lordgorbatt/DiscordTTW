import { data as pingData, command as pingCommand } from './ping.js';
import { data as helpData, command as helpCommand } from './help.js';
import { data as userinfoData, command as userinfoCommand } from './userinfo.js';
import type { Command } from '../types/Command.js';

// Export all command data for slash command registration
export const commandsData = [
  pingData,
  helpData,
  userinfoData,
];

// Export all commands for the command handler
export const commands: Command[] = [
  pingCommand,
  helpCommand,
  userinfoCommand,
];

// Command map for quick lookup
export const commandsMap = new Map<string, Command>(
  commands.map(cmd => [cmd.name, cmd])
);
