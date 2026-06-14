import { describe, expect, it } from 'vitest';
import {
  isoToJalaliInput,
  jalaliInputToIso,
  toPersianDigits,
} from '@/utils/jalaali';

describe('jalaali utilities', () => {
  it('converts ISO date to Jalali display', () => {
    expect(isoToJalaliInput('2026-06-01')).toBe(toPersianDigits('1405/03/12'));
  });

  it('converts Jalali input back to ISO', () => {
    expect(jalaliInputToIso('1405/03/12')).toBe('2026-06-01');
    expect(jalaliInputToIso(toPersianDigits('1405/03/12'))).toBe('2026-06-01');
  });

  it('rejects invalid Jalali dates', () => {
    expect(jalaliInputToIso('1405/13/01')).toBeNull();
    expect(jalaliInputToIso('invalid')).toBeNull();
  });
});
