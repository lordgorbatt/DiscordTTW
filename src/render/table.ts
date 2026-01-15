import type { ComparisonRow } from '../domain/compare.js';

const MAX_MESSAGE_LENGTH = 1900; // Leave room for code block markers and pagination info

export interface TablePage {
  content: string;
  pageNumber: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Render a page of the comparison table
 */
export function renderTablePage(
  rows: ComparisonRow[],
  fileNames: string[],
  pageNumber: number,
  rowsPerPage?: number
): TablePage {
  const totalRows = rows.length;
  
  // Calculate rows per page if not provided
  if (!rowsPerPage) {
    rowsPerPage = calculateRowsPerPage(rows, fileNames);
  }

  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const currentPage = Math.max(1, Math.min(pageNumber, totalPages));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const pageRows = rows.slice(startIndex, endIndex);

  // Build table
  const lines: string[] = [];
  lines.push('All Mods — Comparison Table (alphabetical)');
  lines.push('═'.repeat(100));
  
  // Header
  const header = buildHeader(fileNames);
  lines.push(header);
  lines.push('─'.repeat(100));

  // Rows
  for (const row of pageRows) {
    lines.push(formatRow(row));
  }

  // Footer with pagination info
  lines.push('─'.repeat(100));
  lines.push(`Page ${currentPage} of ${totalPages} (${startIndex + 1}-${endIndex} of ${totalRows} mods)`);

  return {
    content: '```text\n' + lines.join('\n') + '\n```',
    pageNumber: currentPage,
    totalPages,
    startIndex,
    endIndex,
  };
}

function buildHeader(fileNames: string[]): string {
  const parts = [
    'Mod'.padEnd(40),
    'Workshop ID'.padEnd(15),
    'Issues'.padEnd(7),
    'Tags'.padEnd(20),
    'Type'.padEnd(20),
  ];

  // Add file presence columns
  for (let i = 0; i < fileNames.length; i++) {
    const fileName = `File ${i + 1}`.padEnd(10);
    parts.push(fileName);
  }

  parts.push('Link'.padEnd(50));

  return parts.join(' | ');
}

function formatRow(row: ComparisonRow): string {
  const modName = truncate(row.mod, 38).padEnd(40);
  const workshopId = truncate(row.workshop_id, 13).padEnd(15);
  const issues = row.parse_issues.toString().padEnd(7);
  const tags = truncate(row.workshop_tags, 18).padEnd(20);
  const type = truncate(row.derived_type, 18).padEnd(20);

  const parts = [modName, workshopId, issues, tags, type];

  // Add presence indicators
  for (const present of row.presence) {
    parts.push((present ? '✅' : '❌').padEnd(10));
  }

  const link = truncate(row.steam_link, 48).padEnd(50);
  parts.push(link);

  return parts.join(' | ');
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + '...';
}

function calculateRowsPerPage(rows: ComparisonRow[], fileNames: string[]): number {
  // Estimate row length
  const sampleRow = formatRow(rows[0] || createSampleRow(fileNames));
  const rowLength = sampleRow.length + 1; // +1 for newline
  
  // Account for header and footer
  const headerLength = buildHeader(fileNames).length + 1;
  const footerLength = 50; // Approximate
  const overhead = headerLength + footerLength + 20; // Code block markers, etc.

  const availableSpace = MAX_MESSAGE_LENGTH - overhead;
  const rowsPerPage = Math.max(1, Math.floor(availableSpace / rowLength));
  
  return Math.min(rowsPerPage, 50); // Cap at 50 rows per page
}

function createSampleRow(fileNames: string[]): ComparisonRow {
  return {
    mod: 'sample_mod.pack',
    workshop_id: '123456789',
    parse_issues: 0,
    workshop_tags: 'Sample, Tags',
    derived_type: 'Campaign',
    presence: fileNames.map(() => true),
    steam_link: 'https://steamcommunity.com/sharedfiles/filedetails/?id=123456789',
  };
}
