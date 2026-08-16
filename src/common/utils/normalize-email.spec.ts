import { describe, it, expect } from '@jest/globals';
import { normalizeEmail } from './normalize-email';

describe('normalizeEmail', () => {
  it('trims whitespace and lowercases', () => {
    expect(normalizeEmail('  TEST@Gmail.COM  ')).toBe('test@gmail.com');
  });

  it('strips surrounding quotes', () => {
    expect(normalizeEmail('"test@gmail.com"')).toBe('test@gmail.com');
    expect(normalizeEmail('“test@gmail.com”')).toBe('test@gmail.com');
  });

  it('returns empty string for non-string values', () => {
    expect(normalizeEmail(null)).toBe('');
    expect(normalizeEmail(undefined)).toBe('');
  });
});
