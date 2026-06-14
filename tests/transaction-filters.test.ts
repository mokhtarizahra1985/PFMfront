import { describe, expect, it } from 'vitest';
import { parseActivityFilters } from '@/utils/transaction-filters';

describe('transaction filters', () => {
  it('parses filters from URL search params', () => {
    const params = new URLSearchParams(
      'type=EXPENSE&search=نان&page=2&categoryId=abc&dateFrom=2026-06-01&dateTo=2026-06-30',
    );
    const filters = parseActivityFilters(params);

    expect(filters.type).toBe('EXPENSE');
    expect(filters.search).toBe('نان');
    expect(filters.page).toBe(2);
    expect(filters.categoryId).toBe('abc');
    expect(filters.dateFrom).toBe('2026-06-01');
    expect(filters.dateTo).toBe('2026-06-30');
  });

  it('defaults page to 1 when missing', () => {
    const filters = parseActivityFilters(new URLSearchParams());
    expect(filters.page).toBe(1);
  });
});
