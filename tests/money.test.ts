import { describe, expect, it } from 'vitest';
import {
  formatMoney,
  parseMoneyInput,
  toDisplayValue,
  toRialFromInput,
} from '@/utils/money';

describe('money utilities', () => {
  it('formats rial values', () => {
    expect(formatMoney(123456, 'RIAL')).toContain('ریال');
    expect(formatMoney(123456, 'RIAL')).toContain('۱۲۳');
  });

  it('converts rial to toman for display', () => {
    expect(toDisplayValue(10000, 'TOMAN')).toBe(1000);
  });

  it('converts toman input back to rial', () => {
    expect(toRialFromInput(1000, 'TOMAN')).toBe(10000);
  });

  it('parses localized money input', () => {
    expect(parseMoneyInput('1,000')).toBe(1000);
    expect(parseMoneyInput('')).toBeNaN();
  });
});
