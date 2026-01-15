import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import type { ButtonInteraction } from 'discord.js';
import type { ComparisonRow } from '../../domain/compare.js';
import { renderTablePage } from '../../render/table.js';

export interface PaginationSession {
  userId: string;
  rows: ComparisonRow[];
  fileNames: string[];
  currentPage: number;
  expiresAt: number;
}

const SESSION_TTL = 10 * 60 * 1000; // 10 minutes
const sessions = new Map<string, PaginationSession>();

export function createPaginationSession(
  messageId: string,
  userId: string,
  rows: ComparisonRow[],
  fileNames: string[]
): PaginationSession {
  const session: PaginationSession = {
    userId,
    rows,
    fileNames,
    currentPage: 1,
    expiresAt: Date.now() + SESSION_TTL,
  };

  sessions.set(messageId, session);
  return session;
}

export function getSession(messageId: string): PaginationSession | null {
  const session = sessions.get(messageId);
  if (!session) {
    return null;
  }

  if (Date.now() > session.expiresAt) {
    sessions.delete(messageId);
    return null;
  }

  return session;
}

export function createPaginationButtons(currentPage: number, totalPages: number): ActionRowBuilder<ButtonBuilder> {
  const row = new ActionRowBuilder<ButtonBuilder>();

  row.addComponents(
    new ButtonBuilder()
      .setCustomId('pagination_first')
      .setLabel('⏮ First')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage === 1),
    
    new ButtonBuilder()
      .setCustomId('pagination_prev')
      .setLabel('◀ Prev')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === 1),
    
    new ButtonBuilder()
      .setCustomId('pagination_next')
      .setLabel('Next ▶')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage >= totalPages),
    
    new ButtonBuilder()
      .setCustomId('pagination_last')
      .setLabel('Last ⏭')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage >= totalPages),
    
    new ButtonBuilder()
      .setCustomId('pagination_export')
      .setLabel('📎 Export')
      .setStyle(ButtonStyle.Success)
  );

  return row;
}

export async function handlePaginationInteraction(
  interaction: ButtonInteraction,
  session: PaginationSession
): Promise<void> {
  const customId = interaction.customId;

  if (customId === 'pagination_first') {
    session.currentPage = 1;
  } else if (customId === 'pagination_prev') {
    session.currentPage = Math.max(1, session.currentPage - 1);
  } else if (customId === 'pagination_next') {
    // Get current page to determine total pages
    const currentPage = renderTablePage(session.rows, session.fileNames, session.currentPage);
    session.currentPage = Math.min(currentPage.totalPages, session.currentPage + 1);
  } else if (customId === 'pagination_last') {
    const currentPage = renderTablePage(session.rows, session.fileNames, session.currentPage);
    session.currentPage = currentPage.totalPages;
  }

  // Update the message
  const page = renderTablePage(session.rows, session.fileNames, session.currentPage);
  const buttons = createPaginationButtons(page.pageNumber, page.totalPages);

  await interaction.update({
    content: page.content,
    components: [buttons],
  });
}

export function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [messageId, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(messageId);
    }
  }
}

// Cleanup expired sessions every minute
setInterval(cleanupExpiredSessions, 60 * 1000);
