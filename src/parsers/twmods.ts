export interface ParsedMod {
  pack_filename: string;
  workshop_id: string;
  app_id: string;
  timestamp_unix: number;
  lookup_hash: string;
  parse_issues: number;
  original_line?: string;
}

export interface ParseResult {
  mods: ParsedMod[];
  total_lines: number;
  parsed_lines: number;
  error_lines: number;
}

/**
 * Parse a .twmods file content
 * Format: mod_lookup_key://<hash>@steam_workshop:<app_id>/<workshop_id>@<timestamp>/<pack_filename>.pack
 */
export function parseTwmods(content: string): ParseResult {
  const lines = content.split('\n');
  const mods: ParsedMod[] = [];
  let parsed_lines = 0;
  let error_lines = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip blank lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const parseResult = parseModLine(trimmed);
    if (parseResult) {
      mods.push(parseResult);
      parsed_lines++;
    } else {
      error_lines++;
    }
  }

  return {
    mods,
    total_lines: lines.length,
    parsed_lines,
    error_lines,
  };
}

/**
 * Parse a single mod line
 * Expected: mod_lookup_key://<hash>@steam_workshop:<app_id>/<workshop_id>@<timestamp>/<pack_filename>.pack
 */
function parseModLine(line: string): ParsedMod | null {
  try {
    // Extract pack filename (last part after last /)
    const packMatch = line.match(/\/([^/]+\.pack)$/);
    if (!packMatch) {
      return createErrorMod(line, 'Missing pack filename');
    }
    const pack_filename = packMatch[1];

    // Extract workshop_id and app_id from steam_workshop section
    const workshopMatch = line.match(/steam_workshop:(\d+)\/(\d+)/);
    if (!workshopMatch) {
      return createErrorMod(line, 'Missing steam_workshop section', pack_filename);
    }
    const app_id = workshopMatch[1];
    const workshop_id = workshopMatch[2];

    // Extract hash
    const hashMatch = line.match(/mod_lookup_key:\/\/([^@]+)/);
    const lookup_hash = hashMatch ? (hashMatch[1] ?? '') : '';

    // Extract timestamp
    const timestampMatch = line.match(/@(\d+)\//);
    const timestamp_unix = timestampMatch ? parseInt(timestampMatch[1] ?? '0', 10) : 0;

    return {
      pack_filename: pack_filename ?? 'unknown.pack',
      workshop_id: workshop_id ?? '',
      app_id: app_id ?? '',
      timestamp_unix,
      lookup_hash: lookup_hash ?? '',
      parse_issues: 0,
      original_line: line,
    };
  } catch (error) {
    return createErrorMod(line, `Parse error: ${error}`);
  }
}

function createErrorMod(line: string, _reason: string, pack_filename?: string): ParsedMod {
  // Try to extract pack filename even on error
  const packMatch = line.match(/\/([^/]+\.pack)$/);
  const extractedPack = pack_filename || (packMatch ? packMatch[1] : 'unknown.pack');
  
  // Try to extract workshop_id as fallback
  const workshopMatch = line.match(/steam_workshop:\d+\/(\d+)/);
  const extractedWorkshopId = workshopMatch ? (workshopMatch[1] ?? '') : '';

  return {
    pack_filename: extractedPack ?? 'unknown.pack',
    workshop_id: extractedWorkshopId ?? '',
    app_id: '',
    timestamp_unix: 0,
    lookup_hash: '',
    parse_issues: 1,
    original_line: line,
  };
}
