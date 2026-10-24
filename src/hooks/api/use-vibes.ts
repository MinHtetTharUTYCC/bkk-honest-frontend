"use client";

import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { unwrapApiSuccessData } from "@/lib/api/api-envelope";
import { throwApiError } from "@/lib/errors/throw-api-error";
import { openApiClient } from "@/lib/api/openapi-client";
import type { LiveVibeDto, PaginatedLiveVibesDto } from "@/types/api-models";
import { getNextSkipFromPage } from "./base";

export function useLiveVibes(params?: {
  spotId?: string;
  cityId?: string;
  take?: number;
}) {
  const query = useQuery({
    queryKey: ["live-vibes", params],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await openApiClient.GET("/live-vibes", {
        params: {
          query: {
            ...params,
            take: String(params?.take || 10),
          },
        },
      });

      if (error) {
        throwApiError(error);
      }

      const page = unwrapApiSuccessData<PaginatedLiveVibesDto>(data);
      return page.data || [];
    },
  });
  return { ...query, data: query.data || [] };
}

export function useInfiniteLiveVibes(params?: {
  spotId?: string;
  cityId?: string;
  categoryId?: string;
  take?: number;
}) {
  const queryParams = {
    ...params,
    take: String(params?.take || 10),
  };
  return useInfiniteQuery({
    queryKey: ["live-vibes-infinite", params],
    queryFn: async ({ pageParam = 0 }) => {
      const skip = pageParam > 0 ? pageParam : undefined;
      const { data, error } = await openApiClient.GET("/live-vibes", {
        params: {
          query: {
            ...queryParams,
            skip: typeof skip === "number" ? String(skip) : undefined,
          },
        },
      });

      if (error) {
        throwApiError(error);
      }

      return {
        data: unwrapApiSuccessData<PaginatedLiveVibesDto>(data),
      };
    },
    staleTime: 60 * 1000,
    getNextPageParam: (lastPage: unknown) => {
      const pageData =
        typeof lastPage === "object" && lastPage !== null && "data" in lastPage
          ? (lastPage as { data: unknown }).data
          : lastPage;
      return getNextSkipFromPage(pageData, false);
    },
    initialPageParam: 0,
  });
}

export function useCreateLiveVibe() {
  return useMutation({
    mutationKey: ["live-vibes-create"],
    mutationFn: async (payload: {
      spotId: string;
      crowdLevel: number;
      waitTimeMinutes?: number;
    }) => {
      const { data, error } = await openApiClient.POST("/live-vibes", {
        body: payload,
      });

      if (error) {
        throwApiError(error);
      }

      return unwrapApiSuccessData<LiveVibeDto>(data);
    },
  });
}
