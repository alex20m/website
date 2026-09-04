import { describe, expect, it } from 'vitest';
import { companyLogoName } from '@/lib/companyLogo';

describe('companyLogoName', () => {
  it('lowercases and underscores multi-word company names', () => {
    expect(companyLogoName('Aalto University')).toBe('aalto_university');
  });

  it('strips diacritics so the name matches an ASCII filename', () => {
    expect(companyLogoName('Wärtsilä')).toBe('wartsila');
  });

  it('leaves a single-word name lowercased with no underscore', () => {
    expect(companyLogoName('KONE')).toBe('kone');
  });
});
