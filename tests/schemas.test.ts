import { describe, expect, it } from 'vitest';
import { createBudgetSchema } from '@/schemas/budget.schema';
import { createGoalSchema, contributionSchema } from '@/schemas/goal.schema';
import { loginSchema } from '@/schemas/auth.schema';

describe('form schemas', () => {
  it('validates budget creation', () => {
    const valid = createBudgetSchema.safeParse({
      categoryId: 'cat-1',
      limitAmountInput: '500000',
    });
    expect(valid.success).toBe(true);

    const invalid = createBudgetSchema.safeParse({
      categoryId: '',
      limitAmountInput: '0',
    });
    expect(invalid.success).toBe(false);
  });

  it('validates goal creation', () => {
    const valid = createGoalSchema.safeParse({
      title: 'لپ‌تاپ',
      category: 'خرید',
      targetAmountInput: '40000000',
    });
    expect(valid.success).toBe(true);
  });

  it('validates contribution input', () => {
    const valid = contributionSchema.safeParse({
      amountInput: '1000000',
      contributionDate: '2026-06-01',
    });
    expect(valid.success).toBe(true);
  });

  it('requires login credentials', () => {
    const result = loginSchema.safeParse({ email: '', password: '' });
    expect(result.success).toBe(false);
  });
});
