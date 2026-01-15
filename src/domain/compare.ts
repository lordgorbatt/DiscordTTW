import type { ParsedMod } from '../parsers/twmods.js';
import type { CachedWorkshopData } from '../steam/cache.js';

export interface EnrichedMod {
  pack_filename: string;
  workshop_id: string;
  app_id: string;
  timestamp_unix: number;
  lookup_hash: string;
  parse_issues: number;
  workshop_tags: string[];
  derived_type: string;
  title: string;
}

export interface ComparisonRow {
  mod: string; // pack_filename
  workshop_id: string;
  parse_issues: number;
  workshop_tags: string;
  derived_type: string;
  presence: boolean[]; // One boolean per file
  steam_link: string;
}

export interface ComparisonResult {
  rows: ComparisonRow[];
  summary: {
    files_scanned: number;
    union_count: number;
    shared_count: number;
    unique_per_file: number[];
  };
}

/**
 * Derive mod type from Steam tags
 */
export function deriveType(tags: string[]): string {
  const tagLower = tags.map(t => t.toLowerCase());
  
  // Priority 1: Overhaul
  if (tagLower.some(t => t.includes('overhaul'))) {
    const hasCampaign = tagLower.some(t => t.includes('campaign'));
    const hasBattle = tagLower.some(t => t.includes('battle'));
    if (hasCampaign && hasBattle) {
      return 'Overhaul (Campaign, Battle)';
    } else if (hasCampaign) {
      return 'Overhaul (Campaign)';
    } else if (hasBattle) {
      return 'Overhaul (Battle)';
    }
    return 'Overhaul';
  }

  // Priority 2: Graphical
  if (tagLower.some(t => t.includes('graphics') || t.includes('visual') || t.includes('reskin'))) {
    return 'Graphical';
  }

  // Priority 3: Campaign
  if (tagLower.some(t => t.includes('campaign') || t.includes('immortal empires') || t.includes('startpos'))) {
    return 'Campaign';
  }

  // Priority 4: Battle
  if (tagLower.some(t => t.includes('battle') || t.includes('units') || t.includes('combat'))) {
    return 'Battle';
  }

  // Priority 5: UI
  if (tagLower.some(t => t.includes('ui'))) {
    return 'UI';
  }

  return 'Unknown (Workshop)';
}

/**
 * Enrich parsed mods with Steam data
 */
export function enrichMods(
  mods: ParsedMod[],
  steamData: Map<string, CachedWorkshopData>
): EnrichedMod[] {
  return mods.map(mod => {
    const steam = steamData.get(mod.workshop_id);
    const tags = steam ? JSON.parse(steam.tags_json) as string[] : [];
    
    return {
      ...mod,
      workshop_tags: tags,
      derived_type: deriveType(tags),
      title: steam?.title || 'Unknown',
    };
  });
}

/**
 * Compare multiple mod file sets
 */
export function compareModFiles(
  fileMods: ParsedMod[][],
  enrichedMods: EnrichedMod[][]
): ComparisonResult {
  // Build union set - use workshop_id as primary key, fallback to pack_filename
  const unionMap = new Map<string, {
    mod: EnrichedMod;
    fileIndices: Set<number>;
  }>();

  for (let fileIndex = 0; fileIndex < enrichedMods.length; fileIndex++) {
    const mods = enrichedMods[fileIndex];
    if (!mods) continue;
    
    for (const mod of mods) {
      const key = mod.workshop_id || mod.pack_filename;
      const existing = unionMap.get(key);
      
      if (existing) {
        existing.fileIndices.add(fileIndex);
      } else {
        unionMap.set(key, {
          mod,
          fileIndices: new Set([fileIndex]),
        });
      }
    }
  }

  // Convert to rows and sort alphabetically by pack_filename (case-insensitive)
  const rows: ComparisonRow[] = Array.from(unionMap.values())
    .map(({ mod, fileIndices }) => {
      const presence = Array(fileMods.length).fill(false);
      fileIndices.forEach(idx => {
        presence[idx] = true;
      });

      return {
        mod: mod.pack_filename,
        workshop_id: mod.workshop_id || '',
        parse_issues: mod.parse_issues,
        workshop_tags: mod.workshop_tags.join(', ') || '',
        derived_type: mod.derived_type,
        presence,
        steam_link: mod.workshop_id
          ? `https://steamcommunity.com/sharedfiles/filedetails/?id=${mod.workshop_id}`
          : '',
      };
    })
    .sort((a, b) => {
      // Sort by pack_filename (case-insensitive), fallback to workshop_id
      const aKey = a.mod.toLowerCase();
      const bKey = b.mod.toLowerCase();
      if (aKey !== bKey) {
        return aKey.localeCompare(bKey);
      }
      return a.workshop_id.localeCompare(b.workshop_id);
    });

  // Calculate summary
  const sharedCount = rows.filter(r => r.presence.every(p => p)).length;
  const uniquePerFile = fileMods.map((_, fileIndex) => 
    rows.filter(r => r.presence[fileIndex] && r.presence.filter(p => p).length === 1).length
  );

  return {
    rows,
    summary: {
      files_scanned: fileMods.length,
      union_count: rows.length,
      shared_count: sharedCount,
      unique_per_file: uniquePerFile,
    },
  };
}
