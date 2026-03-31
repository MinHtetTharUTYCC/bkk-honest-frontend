"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  useScamAlertsControllerFindBySlug,
  useScamAlertsControllerFindAll,
  useScamAlertsControllerCreate,
  useScamAlertsControllerUpdate,
  useScamAlertsControllerDelete,
  scamAlertsControllerFindAll,
} from "@/api/generated/scam-alerts/scam-alerts";
import { ScamAlertsControllerFindAllSort } from "@/api/generated/model/scamAlertsControllerFindAllSort";
import type { ScamAlertsControllerFindAllParams } from "@/api/generated/model/scamAlertsControllerFindAllParams";
import type { UpdateScamAlertDto } from "@/api/generated/model/updateScamAlertDto";
import type { PaginatedScamAlertsResponseDto } from "@/api/generated/model/paginatedScamAlertsResponseDto";
import { getNextSkipFromPage } from "./base";

export function useScamAlertBySlug(citySlug: string, alertSlug: string) {
  const query = useScamAlertsControllerFindBySlug(citySlug, alertSlug, {
    query: { enabled: !!citySlug && !!alertSlug },
  });
  const data =
    (query.data as PaginatedScamAlertsResponseDto | undefined)?.data ||
    query.data;
  return { ...query, data };
}

export function useScamAlerts(params?: {
  cityId?: string;
  categoryId?: string;
  sort?: "newest" | "popular";
  search?: string;
  take?: number;
}) {
  const cleanParams: ScamAlertsControllerFindAllParams = {};
  if (params) {
    if (params.cityId) cleanParams.cityId = params.cityId;
    if (params.categoryId) cleanParams.categoryId = params.categoryId;
    if (params.sort)
      cleanParams.sort =
        params.sort === "popular"
          ? ScamAlertsControllerFindAllSort.popular
          : ScamAlertsControllerFindAllSort.newest;
    if (params.search) cleanParams.search = params.search;
    if (params.take) cleanParams.take = params.take;
  }

  const query = useScamAlertsControllerFindAll(cleanParams, {
    query: {
      queryKey: ["scam-alerts", cleanParams],
      staleTime: 5 * 60 * 1000,
    },
  });
  return { ...query, data: query.data?.data || [] };
}

export function useInfiniteScamAlerts(params?: {
  cityId?: string;
  categoryId?: string;
  sort?: "newest" | "popular";
  search?: string;
  take?: number;
}) {
  const cleanParams: ScamAlertsControllerFindAllParams = {};
  if (params) {
    if (params.cityId) cleanParams.cityId = params.cityId;
    if (params.categoryId) cleanParams.categoryId = params.categoryId;
    if (params.sort) {
      cleanParams.sort =
        params.sort === "popular"
          ? ScamAlertsControllerFindAllSort.popular
          : ScamAlertsControllerFindAllSort.newest;
    }
    if (params.search) cleanParams.search = params.search;
    cleanParams.take = params.take || 10;
  }

  return useInfiniteQuery({
    queryKey: ["scam-alerts-infinite", cleanParams],
    queryFn: async ({ pageParam = 0 }) => {
      const skip = pageParam > 0 ? pageParam : undefined;
      return scamAlertsControllerFindAll({ ...cleanParams, skip });
    },
    staleTime: 5 * 60 * 1000,
    getNextPageParam: (lastPage: unknown) =>
      getNextSkipFromPage(lastPage, false),
    initialPageParam: 0,
  });
}

export function useCreateScamAlert() {
  const mutation = useScamAlertsControllerCreate();
  return {
    ...mutation,
    mutate: (payload: {
      scamName: string;
      description: string;
      preventionTip: string;
      cityId: string;
      categoryId: string;
      image?: File;
    }) => mutation.mutate({ data: payload }),
    mutateAsync: (payload: {
      scamName: string;
      description: string;
      preventionTip: string;
      cityId: string;
      categoryId: string;
      image?: File;
    }) => mutation.mutateAsync({ data: payload }),
  };
}

export function useUpdateScamAlert() {
  const mutation = useScamAlertsControllerUpdate();
  return {
    ...mutation,
    mutate: ({ id, payload }: { id: string; payload: UpdateScamAlertDto }) =>
      mutation.mutate({ id, data: payload }),
    mutateAsync: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateScamAlertDto;
    }) => mutation.mutateAsync({ id, data: payload }),
  };
}

export function useDeleteScamAlert() {
  const mutation = useScamAlertsControllerDelete();
  return {
    ...mutation,
    mutate: (id: string) => mutation.mutate({ id }),
    mutateAsync: (id: string) => mutation.mutateAsync({ id }),
  };
}
