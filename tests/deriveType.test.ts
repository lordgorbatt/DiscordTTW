import { describe, it, expect } from 'vitest';
import { deriveType } from '../src/domain/compare.js';

describe('deriveType', () => {
  it('should return "Overhaul" for overhaul tags', () => {
    expect(deriveType(['Overhaul'])).toBe('Overhaul');
    expect(deriveType(['overhaul', 'other'])).toBe('Overhaul');
  });

  it('should return "Overhaul (Campaign)" for overhaul with campaign', () => {
    expect(deriveType(['Overhaul', 'Campaign'])).toBe('Overhaul (Campaign)');
    expect(deriveType(['overhaul', 'campaign'])).toBe('Overhaul (Campaign)');
  });

  it('should return "Overhaul (Battle)" for overhaul with battle', () => {
    expect(deriveType(['Overhaul', 'Battle'])).toBe('Overhaul (Battle)');
  });

  it('should return "Overhaul (Campaign, Battle)" for all three', () => {
    expect(deriveType(['Overhaul', 'Campaign', 'Battle'])).toBe('Overhaul (Campaign, Battle)');
  });

  it('should return "Graphical" for graphics tags', () => {
    expect(deriveType(['Graphics'])).toBe('Graphical');
    expect(deriveType(['Visual'])).toBe('Graphical');
    expect(deriveType(['Reskin'])).toBe('Graphical');
  });

  it('should return "Campaign" for campaign tags', () => {
    expect(deriveType(['Campaign'])).toBe('Campaign');
    expect(deriveType(['Immortal Empires'])).toBe('Campaign');
    expect(deriveType(['Startpos'])).toBe('Campaign');
  });

  it('should return "Battle" for battle tags', () => {
    expect(deriveType(['Battle'])).toBe('Battle');
    expect(deriveType(['Units'])).toBe('Battle');
    expect(deriveType(['Combat'])).toBe('Battle');
  });

  it('should return "UI" for UI tags', () => {
    expect(deriveType(['UI'])).toBe('UI');
    expect(deriveType(['ui', 'other'])).toBe('UI');
  });

  it('should return "Unknown (Workshop)" for unknown tags', () => {
    expect(deriveType([])).toBe('Unknown (Workshop)');
    expect(deriveType(['Random Tag'])).toBe('Unknown (Workshop)');
  });

  it('should prioritize Overhaul over other types', () => {
    expect(deriveType(['Overhaul', 'Graphics'])).toBe('Overhaul');
  });

  it('should prioritize Graphical over Campaign/Battle', () => {
    expect(deriveType(['Graphics', 'Campaign'])).toBe('Graphical');
    expect(deriveType(['Visual', 'Battle'])).toBe('Graphical');
  });
});
