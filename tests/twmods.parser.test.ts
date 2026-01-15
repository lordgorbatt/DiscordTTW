import { describe, it, expect } from 'vitest';
import { parseTwmods } from '../src/parsers/twmods.js';

describe('twmods parser', () => {
  it('should parse a valid mod line', () => {
    const content = `mod_lookup_key://abc123@steam_workshop:1142710/123456789@1699123456/mod_name.pack`;
    
    const result = parseTwmods(content);
    
    expect(result.mods).toHaveLength(1);
    expect(result.mods[0]).toMatchObject({
      pack_filename: 'mod_name.pack',
      workshop_id: '123456789',
      app_id: '1142710',
      timestamp_unix: 1699123456,
      lookup_hash: 'abc123',
      parse_issues: 0,
    });
  });

  it('should skip blank lines and comments', () => {
    const content = `
# This is a comment

mod_lookup_key://hash@steam_workshop:1142710/123@1000/test.pack

# Another comment

`;
    
    const result = parseTwmods(content);
    
    expect(result.mods).toHaveLength(1);
    expect(result.mods[0].pack_filename).toBe('test.pack');
  });

  it('should handle multiple mods', () => {
    const content = `mod_lookup_key://hash1@steam_workshop:1142710/111@1000/mod1.pack
mod_lookup_key://hash2@steam_workshop:1142710/222@2000/mod2.pack`;
    
    const result = parseTwmods(content);
    
    expect(result.mods).toHaveLength(2);
    expect(result.mods[0].pack_filename).toBe('mod1.pack');
    expect(result.mods[1].pack_filename).toBe('mod2.pack');
  });

  it('should handle malformed lines with parse_issues', () => {
    const content = `invalid line without proper format
mod_lookup_key://hash@steam_workshop:1142710/123@1000/valid.pack`;
    
    const result = parseTwmods(content);
    
    expect(result.mods).toHaveLength(2);
    expect(result.mods[0].parse_issues).toBe(1);
    expect(result.mods[1].parse_issues).toBe(0);
  });

  it('should extract pack filename correctly', () => {
    const content = `mod_lookup_key://hash@steam_workshop:1142710/123@1000/complex_mod_name_v2.5.pack`;
    
    const result = parseTwmods(content);
    
    expect(result.mods[0].pack_filename).toBe('complex_mod_name_v2.5.pack');
  });

  it('should handle missing optional fields', () => {
    const content = `mod_lookup_key://@steam_workshop:1142710/123@/test.pack`;
    
    const result = parseTwmods(content);
    
    expect(result.mods).toHaveLength(1);
    expect(result.mods[0].lookup_hash).toBe('');
    expect(result.mods[0].timestamp_unix).toBe(0);
  });
});
