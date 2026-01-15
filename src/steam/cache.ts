import Database from 'better-sqlite3';
import type { SteamFileDetails } from './api.js';

export interface CachedWorkshopData {
  workshop_id: string;
  title: string;
  tags_json: string;
  time_updated: number;
  fetched_at: number;
}

export class SteamCache {
  private db: Database.Database;

  constructor(dbPath: string = './steam_cache.db') {
    this.db = new Database(dbPath);
    this.initDatabase();
  }

  private initDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workshop_cache (
        workshop_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        tags_json TEXT NOT NULL,
        time_updated INTEGER NOT NULL,
        fetched_at INTEGER NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_fetched_at ON workshop_cache(fetched_at);
    `);
  }

  /**
   * Get cached data if still valid
   */
  get(workshopId: string): CachedWorkshopData | null {
    const row = this.db
      .prepare('SELECT * FROM workshop_cache WHERE workshop_id = ?')
      .get(workshopId) as CachedWorkshopData | undefined;

    if (!row) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const age = now - row.fetched_at;
    
    // Calculate TTL based on time_updated
    const timeSinceUpdate = now - row.time_updated;
    const ttl = timeSinceUpdate < 7 * 24 * 60 * 60 ? 12 * 60 * 60 : 7 * 24 * 60 * 60;

    if (age > ttl) {
      // Cache expired
      return null;
    }

    return row;
  }

  /**
   * Store workshop data in cache
   */
  set(workshopId: string, data: SteamFileDetails): void {
    const tags = data.tags || [];
    const tagsJson = JSON.stringify(tags.map(t => t.tag));
    const fetchedAt = Math.floor(Date.now() / 1000);

    this.db
      .prepare(
        `INSERT OR REPLACE INTO workshop_cache 
         (workshop_id, title, tags_json, time_updated, fetched_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        workshopId,
        data.title || 'Unknown',
        tagsJson,
        data.time_updated || fetchedAt,
        fetchedAt
      );
  }

  /**
   * Batch get with filtering of expired entries
   */
  getBatch(workshopIds: string[]): Map<string, CachedWorkshopData> {
    const result = new Map<string, CachedWorkshopData>();
    
    for (const id of workshopIds) {
      const cached = this.get(id);
      if (cached) {
        result.set(id, cached);
      }
    }

    return result;
  }

  /**
   * Batch set
   */
  setBatch(data: Map<string, SteamFileDetails>): void {
    const stmt = this.db.prepare(
      `INSERT OR REPLACE INTO workshop_cache 
       (workshop_id, title, tags_json, time_updated, fetched_at)
       VALUES (?, ?, ?, ?, ?)`
    );

    const transaction = this.db.transaction((entries: Array<[string, SteamFileDetails]>) => {
      for (const [workshopId, details] of entries) {
        const tags = details.tags || [];
        const tagsJson = JSON.stringify(tags.map(t => t.tag));
        const fetchedAt = Math.floor(Date.now() / 1000);

        stmt.run(
          workshopId,
          details.title || 'Unknown',
          tagsJson,
          details.time_updated || fetchedAt,
          fetchedAt
        );
      }
    });

    transaction(Array.from(data.entries()));
  }

  close(): void {
    this.db.close();
  }
}
