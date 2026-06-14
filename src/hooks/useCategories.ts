import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  categoriesApi,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '@/api/categories.api';
import type { CategoryType } from '@/types/api.types';

export function categoriesQueryKey(type?: CategoryType) {
  return type ? (['categories', type] as const) : (['categories'] as const);
}

export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: categoriesQueryKey(type),
    queryFn: () => categoriesApi.list(type),
  });
}

export function useActiveCategories(type: CategoryType) {
  const query = useCategories(type);
  const data = useMemo(
    () => query.data?.filter((category) => category.isActive),
    [query.data],
  );

  return {
    ...query,
    data,
  };
}

export function useCategoryMutations(type: CategoryType) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const createMutation = useMutation({
    mutationFn: (input: CreateCategoryInput) => categoriesApi.create(input),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      categoriesApi.update(id, input),
    onSuccess: invalidate,
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.deactivate(id),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deactivateMutation, type };
}
