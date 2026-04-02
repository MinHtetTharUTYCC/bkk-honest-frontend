"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  useSpotsControllerFindOne,
  useSpotsControllerFindBySlug,
  useSpotsControllerFindAll,
  useSpotsControllerFindNearby,
  useSpotsControllerSearch,
  spotsControllerFindAll,
  useSpotsControllerCreate,
  useSpotsControllerUpdate,
  useSpotsControllerReverseGeocode,
} from "@/api/generated/spots/spots";
import type {
  SpotWithStatsResponseDto,
  PaginatedSpotsWithStatsResponseDto,
  CreateSpotDto,
  UpdateSpotDto,
  SpotsControllerFindAllParams,
  SpotsControllerFindNearbyParams,
  SpotsControllerSearchParams,
} from "@/api/generated/model";
import { getNextSkipFromPage } from "./base";

export function useSpot(id: string) {
  const query = useSpotsControllerFindOne(id, { query: { enabled: !!id } });
  const data =
    (query.data as PaginatedSpotsWithStatsResponseDto | undefined)?.data ||
    query.data;
  return { ...query, data };
}

export function useSpotBySlug(citySlug: string, spotSlug: string) {
  const query = useSpotsControllerFindBySlug(citySlug, spotSlug, {
    query: { enabled: !!citySlug && !!spotSlug },
  });
  const data =
    (query.data as PaginatedSpotsWithStatsResponseDto | undefined)?.data ||
    query.data;
  return { ...query, data };
}

export function useSpots(params?: {
  categoryId?: string;
  cityId?: string;
  search?: string;
  sort?: "newest" | "popular";
}) {
  const cleanParams: SpotsControllerFindAllParams = {};
  if (params) {
    if (params.categoryId) cleanParams.categoryId = params.categoryId;
    if (params.cityId) cleanParams.cityId = params.cityId;
    if (params.search) cleanParams.search = params.search;
    if (params.sort) cleanParams.sort = params.sort;
  }

  const query = useSpotsControllerFindAll(cleanParams, {
    query: { staleTime: 5 * 60 * 1000 },
  });
  return { ...query, data: query.data || [] };
}

export function useInfiniteSpots(params?: {
  categoryId?: string;
  cityId?: string;
  search?: string;
  sort?: "newest" | "popular";
  take?: number;
}) {
  const cleanParams: SpotsControllerFindAllParams = {};
  if (params) {
    if (params.categoryId) cleanParams.categoryId = params.categoryId;
    if (params.cityId) cleanParams.cityId = params.cityId;
    if (params.search) cleanParams.search = params.search;
    if (params.sort) cleanParams.sort = params.sort;
    cleanParams.take = params.take || 10;
  }

  return useInfiniteQuery({
    queryKey: ["spots-infinite", cleanParams],
    queryFn: async ({ pageParam = 0 }) => {
      const skip = pageParam > 0 ? pageParam : undefined;
      return spotsControllerFindAll({ ...cleanParams, skip });
    },
    getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage),
    staleTime: 5 * 60 * 1000,
    initialPageParam: 0,
  });
}

export function useNearbySpots(
  params: SpotsControllerFindNearbyParams & {
    latitude: number;
    longitude: number;
  },
  enabled = true,
) {
  const query = useSpotsControllerFindNearby(params, {
    query: {
      queryKey: ["spots-nearby", params] as const,
      enabled: enabled && !!params.latitude && !!params.longitude,
      placeholderData: (previousData) => previousData,
      staleTime: 60_000,
    },
  });

  // Backend returns { data: SpotWithStatsResponseDto[] }
  const rawData = query.data as
    | PaginatedSpotsWithStatsResponseDto
    | SpotWithStatsResponseDto[]
    | undefined;
  const spots = Array.isArray(rawData) ? rawData : rawData?.data || [];
  return { ...query, data: spots };
}

export function useSpotSearch(
  queryStr: string,
  cityId?: string,
  limit: number = 20,
) {
  const params: SpotsControllerSearchParams = { q: queryStr };
  if (cityId) params.cityId = cityId;
  if (limit !== 20) params.limit = limit;

  const query = useSpotsControllerSearch(params, {
    query: {
      queryKey: ["spot-search", queryStr, cityId],
      enabled: queryStr.trim().length >= 1,
    },
  });

  // Handle both direct array and wrapped response
  const rawData = query.data as
    | PaginatedSpotsWithStatsResponseDto
    | SpotWithStatsResponseDto[]
    | undefined;
  const spots = Array.isArray(rawData) ? rawData : rawData?.data || [];
  return { ...query, data: spots };
}

export function useCreateSpot() {
  const mutation = useSpotsControllerCreate();
  return {
    ...mutation,
    mutate: (payload: CreateSpotDto | FormData) =>
      mutation.mutate({ data: payload as any }),
    mutateAsync: (payload: CreateSpotDto | FormData) =>
      mutation.mutateAsync({ data: payload as any }),
  };
}

export function useUpdateSpot() {
  const mutation = useSpotsControllerUpdate();
  return {
    ...mutation,
    mutate: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSpotDto | FormData;
    }) => mutation.mutate({ id, data: payload as any }),
    mutateAsync: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSpotDto | FormData;
    }) => mutation.mutateAsync({ id, data: payload as any }),
  };
}

export function useReverseGeocode() {
  const mutation = useSpotsControllerReverseGeocode();
  return {
    ...mutation,
    mutate: () => mutation.mutate(),
    mutateAsync: () => mutation.mutateAsync(),
  };
}

// --- Popular Area (deprecated, returns empty) ---
export function usePopularArea() {
  return { data: null, isLoading: false, error: null };
}
