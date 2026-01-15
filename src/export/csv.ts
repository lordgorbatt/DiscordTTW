import type { ComparisonRow } from '../domain/compare.js';

export function generateCSV(rows: ComparisonRow[], fileNames: string[]): string {
  const lines: string[] = [];

  // Header
  const header = [
    'Mod',
    'Workshop ID',
    'Parse Issues',
    'Workshop Tags',
    'Derived Type',
    ...fileNames.map((_, i) => `File ${i + 1}`),
    'Steam Workshop Link',
  ];
  lines.push(escapeCSV(header));

  // Rows
  for (const row of rows) {
    const csvRow = [
      row.mod,
      row.workshop_id,
      row.parse_issues.toString(),
      row.workshop_tags,
      row.derived_type,
      ...row.presence.map(p => p ? 'Yes' : 'No'),
      row.steam_link,
    ];
    lines.push(escapeCSV(csvRow));
  }

  return lines.join('\n');
}

function escapeCSV(fields: string[]): string {
  return fields.map(field => {
    // If field contains comma, quote, or newline, wrap in quotes and escape quotes
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }).join(',');
}
