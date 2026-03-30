"use client";

import { useCategoriesControllerFindAll } from "@/api/generated/categories/categories";
import { useCitiesControllerFindAll } from "@/api/generated/cities/cities";

export function useCategories() {
  const query = useCategoriesControllerFindAll({
    query: {
      staleTime: 24 * 60 * 60 * 1000,
      gcTime: 48 * 60 * 60 * 1000,
    },
  });
  return { ...query, data: Array.isArray(query.data) ? query.data : [] };
}

export function useCities() {
  const query = useCitiesControllerFindAll({
    query: {
      staleTime: 24 * 60 * 60 * 1000,
      gcTime: 48 * 60 * 60 * 1000,
    },
  });
  return { ...query, data: Array.isArray(query.data) ? query.data : [] };
}
