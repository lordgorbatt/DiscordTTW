import type { ComparisonRow } from '../domain/compare.js';

export interface ExportRow {
  mod: string;
  workshop_id: string;
  presence: boolean[];
  steam_link: string;
}

export function generateJSON(rows: ComparisonRow[]): string {
  const exportData: ExportRow[] = rows.map(row => ({
    mod: row.mod,
    workshop_id: row.workshop_id,
    presence: row.presence,
    steam_link: row.steam_link,
  }));

  return JSON.stringify(exportData, null, 2);
}
