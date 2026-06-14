import { describe, expect, it } from 'vitest';
import { formatDifferenceLabel, formatPercentChange } from '@/utils/report-diff';

describe('report diff utilities', () => {
  it('formats percent change safely', () => {
    expect(formatPercentChange(120, 100)).toBe('+20٪');
    expect(formatPercentChange(80, 100)).toBe('-20٪');
    expect(formatPercentChange(0, 0)).toBe('۰٪');
    expect(formatPercentChange(100, 0)).toBe('—');
  });

  it('labels difference direction in Persian', () => {
    expect(formatDifferenceLabel(1000)).toBe('افزایش');
    expect(formatDifferenceLabel(-500)).toBe('کاهش');
    expect(formatDifferenceLabel(0)).toBe('بدون تغییر');
  });
});
