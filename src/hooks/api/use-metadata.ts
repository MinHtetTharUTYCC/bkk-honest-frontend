"use client";

import { useQuery } from "@tanstack/react-query";
import { unwrapApiSuccessData } from "@/lib/api/api-envelope";
import { throwApiError } from "@/lib/errors/throw-api-error";
import { openApiClient } from "@/lib/api/openapi-client";
import type { CategoryDto, CityDto } from "@/types/api-models";

export function useCategories() {
  const query = useQuery({
    queryKey: ["categories"],
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await openApiClient.GET("/categories");

      if (error) {
        throwApiError(error);
      }

      return unwrapApiSuccessData<CategoryDto[]>(data);
    },
  });
  return { ...query, data: Array.isArray(query.data) ? query.data : [] };
}

export function useCities() {
  const query = useQuery({
    queryKey: ["cities"],
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await openApiClient.GET("/cities");

      if (error) {
        throwApiError(error);
      }

      return unwrapApiSuccessData<CityDto[]>(data);
    },
  });
  return { ...query, data: Array.isArray(query.data) ? query.data : [] };
}
