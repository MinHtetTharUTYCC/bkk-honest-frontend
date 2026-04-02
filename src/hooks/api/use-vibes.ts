"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  useLiveVibesControllerFindAll as _useLiveVibesControllerFindAll,
  useLiveVibesControllerCreate,
  liveVibesControllerFindAll,
} from "@/api/generated/live-vibes/live-vibes";
import { getNextSkipFromPage } from "./base";

export function useLiveVibes(params?: {
  spotId?: string;
  cityId?: string;
  take?: number;
}) {
  const query = _useLiveVibesControllerFindAll(
    {
      ...params,
      take: (params?.take || 10).toString(),
    },
    {
      query: {
        queryKey: ["live-vibes", params],
        staleTime: 60 * 1000,
      },
    },
  );
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
    take: (params?.take || 10).toString(),
  };
  return useInfiniteQuery({
    queryKey: ["live-vibes-infinite", params],
    queryFn: async ({ pageParam = "0" }) => {
      const skip = Number(pageParam) > 0 ? pageParam : undefined;
      return liveVibesControllerFindAll({ ...queryParams, skip });
    },
    staleTime: 60 * 1000,
    getNextPageParam: (lastPage: unknown) => {
      const skip = getNextSkipFromPage(lastPage, false);
      return skip ? String(skip) : undefined;
    },
    initialPageParam: "0",
  });
}

export function useCreateLiveVibe() {
  const mutation = useLiveVibesControllerCreate();
  return {
    ...mutation,
    mutate: (payload: {
      spotId: string;
      crowdLevel: number;
      waitTimeMinutes?: number;
    }) => mutation.mutate({ data: payload }),
    mutateAsync: (payload: {
      spotId: string;
      crowdLevel: number;
      waitTimeMinutes?: number;
    }) => mutation.mutateAsync({ data: payload }),
  };
}
