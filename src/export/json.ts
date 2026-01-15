import type { ComparisonRow } from '../domain/compare.js';

export interface ExportRow {
  mod: string;
  presence: boolean[];
}

export function generateJSON(rows: ComparisonRow[]): string {
  const exportData: ExportRow[] = rows.map(row => ({
    mod: row.mod,
    presence: row.presence,
  }));

  return JSON.stringify(exportData, null, 2);
}
