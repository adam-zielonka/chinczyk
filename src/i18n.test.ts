import { describe, expect, it } from 'vitest';
import { detectLanguage } from './i18n';

describe('language preference resolution', () => {
  it('gives a valid saved choice priority over browser preferences', () => {
    expect(detectLanguage('pl', ['en-US'])).toBe('pl');
    expect(detectLanguage('en', ['pl-PL'])).toBe('en');
  });
  it('uses the first supported preference, including regional variants', () => {
    expect(detectLanguage(null, ['de-DE', 'pl-PL', 'en-GB'])).toBe('pl');
    expect(detectLanguage(null, ['en-US', 'pl'])).toBe('en');
    expect(detectLanguage(null, ['PL_pl'])).toBe('pl');
  });
  it('ignores invalid saved values and falls back to English', () => {
    expect(detectLanguage('invalid', ['pl-PL'])).toBe('pl');
    expect(detectLanguage(null, ['fr-FR'])).toBe('en');
    expect(detectLanguage(null, [])).toBe('en');
  });
});
