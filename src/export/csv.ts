import type { ComparisonRow } from '../domain/compare.js';

export function generateCSV(rows: ComparisonRow[], fileNames: string[]): string {
  const lines: string[] = [];

  // Header
  const header = [
    'Mod',
    ...fileNames,
  ];
  lines.push(escapeCSV(header));

  // Rows
  for (const row of rows) {
    const csvRow = [
      row.mod,
      ...row.presence.map(p => p ? 'Yes' : 'No'),
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
