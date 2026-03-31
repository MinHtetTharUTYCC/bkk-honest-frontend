"use client";

import { useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  useChecklistControllerCreate,
  useChecklistControllerUpdate,
  useChecklistControllerDelete,
  useChecklistControllerFindAll,
  useChecklistControllerGetStats,
  checklistControllerFindAll,
} from "@/api/generated/checklist/checklist";
import type { ChecklistItemDto } from "@/api/generated/model";
import { getNextSkipFromPage } from "./base";

export function useMissions(
  status: string = "all",
  sort: string = "newest",
  userId: string = "me",
) {
  const params = {
    status: status === "all" ? undefined : status,
    sort: sort,
    take: "10",
  };
  return useInfiniteQuery({
    queryKey: ["missions-infinite", userId, status, sort] as const,
    queryFn: async ({ pageParam = 0 }) => {
      const skip = pageParam > 0 ? String(pageParam) : undefined;
      return checklistControllerFindAll({ ...params, skip });
    },
    getNextPageParam: (lastPage: unknown) => {
      const skip = getNextSkipFromPage(lastPage);
      return skip ? skip : undefined;
    },
    enabled: userId === "me",
    initialPageParam: 0,
  });
}

export function useMissionStats() {
  const query = useChecklistControllerGetStats({
    query: { queryKey: ["mission-stats"] },
  });
  return { ...query, data: query.data?.data };
}

/**
 * Robust helper to update item data in various cache structures
 */
function updateItemInCache<T extends { id: string }>(
  old: unknown,
  spotId: string,
  updates: Partial<T>,
): unknown {
  if (!old || typeof old !== "object") return old;

  const cacheData = old as { pages?: Array<{ data?: T[] }> } & {
    data?: T | T[];
  };

  // Handle Infinite Query structure { pages: { data: Item[] }[] }
  if (cacheData.pages && Array.isArray(cacheData.pages)) {
    return {
      ...cacheData,
      pages: cacheData.pages.map((page) => ({
        ...page,
        data: page.data?.map((item) =>
          item?.id === spotId ? { ...item, ...updates } : item,
        ),
      })),
    };
  }

  // Handle { data: Item } structure
  if (cacheData.data && !Array.isArray(cacheData.data)) {
    const dataItem = cacheData.data as T;
    if (dataItem.id === spotId) {
      return { ...cacheData, data: { ...dataItem, ...updates } };
    }
    return cacheData;
  }

  // Handle { data: Item[] } or Item[] structure
  const dataArray = Array.isArray(cacheData.data)
    ? cacheData.data
    : Array.isArray(cacheData)
      ? cacheData
      : null;
  if (dataArray) {
    const newData = dataArray.map((item) =>
      item?.id === spotId ? { ...item, ...updates } : item,
    );
    return Array.isArray(cacheData.data)
      ? { ...cacheData, data: newData }
      : newData;
  }

  // Handle raw Item object structure
  const maybeItem = cacheData as T;
  if (maybeItem.id === spotId) {
    return { ...maybeItem, ...updates };
  }

  return cacheData;
}

export function useAddMission() {
  const mutation = useChecklistControllerCreate();
  const queryClient = useQueryClient();
  return {
    ...mutation,
    mutate: (spotId: string) =>
      mutation.mutate(
        { data: { spotId } },
        {
          onSuccess: (data) => {
            const newItem =
              ((data as unknown as Record<string, unknown>)
                ?.data as ChecklistItemDto) ||
              (data as unknown as ChecklistItemDto);

            // 1. Update all variations of the missions list cache
            queryClient.setQueriesData(
              { queryKey: ["missions-infinite"] },
              (old: unknown) => {
                const cacheData = old as
                  | { pages?: Array<{ data?: ChecklistItemDto[] }> }
                  | undefined;
                if (!cacheData || !cacheData.pages) return cacheData;
                const newPages = [...cacheData.pages];
                if (newPages.length > 0) {
                  const firstPage = { ...newPages[0] };
                  firstPage.data = [newItem, ...(firstPage.data || [])];
                  newPages[0] = firstPage;
                } else {
                  newPages[0] = { data: [newItem] };
                }
                return { ...cacheData, pages: newPages };
              },
            );

            // 2. Update the specific spot detail cache
            const spotPredicate = (query: { queryKey: readonly unknown[] }) => {
              const key = query.queryKey[0];
              if (typeof key !== "string") return false;
              return (
                key === "spot" || key === "spots" || key.startsWith("/spots")
              );
            };

            queryClient.setQueriesData(
              { predicate: spotPredicate },
              (old: unknown) =>
                updateItemInCache<{
                  id: string;
                  isInMission?: boolean;
                  missionId?: string | null;
                }>(old, spotId, { isInMission: true, missionId: newItem.id }),
            );

            queryClient.invalidateQueries({ queryKey: ["mission-stats"] });
          },
        },
      ),
    mutateAsync: (spotId: string) => mutation.mutateAsync({ data: { spotId } }),
  };
}

export function useUpdateMission() {
  const mutation = useChecklistControllerUpdate();
  const queryClient = useQueryClient();
  return {
    ...mutation,
    mutate: ({
      id,
      completed,
      currentStatus,
      currentSort,
    }: {
      id: string;
      completed: boolean;
      currentStatus?: string;
      currentSort?: string;
    }) =>
      mutation.mutate(
        { id, data: { completed } },
        {
          onSuccess: (response) => {
            const updatedItem = response.data;
            const currentKey = [
              "missions-infinite",
              "me",
              currentStatus || "all",
              currentSort || "newest",
            ];

            // Surgical update: remove from current tab if status changes
            queryClient.setQueryData(currentKey, (old: unknown) => {
              const cacheData = old as
                | { pages?: Array<{ data?: ChecklistItemDto[] }> }
                | undefined;
              if (!cacheData || !cacheData.pages) return cacheData;

              // Remove item if switching status (pending → completed or vice versa)
              const shouldRemove =
                (currentStatus === "pending" && completed) ||
                (currentStatus === "completed" && !completed);

              if (shouldRemove) {
                return {
                  ...cacheData,
                  pages: cacheData.pages.map((page) => ({
                    ...page,
                    data: page.data?.filter((m) => m?.id !== id),
                  })),
                };
              }

              // Otherwise update in place (for 'all' tab)
              return {
                ...cacheData,
                pages: cacheData.pages.map((page) => ({
                  ...page,
                  data: page.data?.map((m) =>
                    m?.id === id ? { ...m, ...updatedItem } : m,
                  ),
                })),
              };
            });

            // Invalidate other status tabs to sync when user switches
            const otherStatuses = ["pending", "completed", "all"].filter(
              (s) => s !== currentStatus,
            );
            otherStatuses.forEach((status) => {
              queryClient.invalidateQueries({
                queryKey: ["missions-infinite", "me", status, currentSort],
              });
            });

            queryClient.invalidateQueries({ queryKey: ["mission-stats"] });
          },
        },
      ),
    mutateAsync: ({
      id,
      completed,
    }: {
      id: string;
      completed: boolean;
      currentStatus?: string;
      currentSort?: string;
    }) => mutation.mutateAsync({ id, data: { completed } }),
  };
}

export function useDeleteMission() {
  const mutation = useChecklistControllerDelete();
  const queryClient = useQueryClient();
  return {
    ...mutation,
    mutate: (
      id: string,
      currentStatus = "all",
      currentSort = "newest",
      spotId?: string,
    ) =>
      mutation.mutate(
        { id },
        {
          onSuccess: () => {
            let deletedSpotId: string | undefined = spotId;
            const currentKey = [
              "missions-infinite",
              "me",
              currentStatus,
              currentSort,
            ];

            // Surgical update: remove from current tab
            queryClient.setQueryData(currentKey, (old: unknown) => {
              const cacheData = old as
                | { pages?: Array<{ data?: ChecklistItemDto[] }> }
                | undefined;
              if (!cacheData || !cacheData.pages) return cacheData;

              // If spotId not provided, try to find it from cache
              if (!deletedSpotId) {
                for (const page of cacheData.pages) {
                  const found = page.data?.find((m) => m?.id === id);
                  if (found) {
                    deletedSpotId = (found.spot as { id?: string } | undefined)?.id;
                    break;
                  }
                }
              }

              return {
                ...cacheData,
                pages: cacheData.pages.map((page) => ({
                  ...page,
                  data: page.data?.filter((m) => m?.id !== id),
                })),
              };
            });

            // Invalidate all other tabs to sync deletion
            const otherStatuses = ["pending", "completed", "all"].filter(
              (s) => s !== currentStatus,
            );
            otherStatuses.forEach((status) => {
              queryClient.invalidateQueries({
                queryKey: ["missions-infinite", "me", status, currentSort],
              });
            });

            // 2. Update the specific spot detail cache
            if (deletedSpotId) {
              const spotPredicate = (query: {
                queryKey: readonly unknown[];
              }) => {
                const key = query.queryKey[0];
                if (typeof key !== "string") return false;
                return (
                  key === "spot" || key === "spots" || key.startsWith("/spots")
                );
              };

              queryClient.setQueriesData(
                { predicate: spotPredicate },
                (old: unknown) =>
                  updateItemInCache<{
                    id: string;
                    isInMission?: boolean;
                    missionId?: string | null;
                  }>(old, deletedSpotId!, {
                    isInMission: false,
                    missionId: null,
                  }),
              );
            }

            queryClient.invalidateQueries({ queryKey: ["mission-stats"] });
          },
        },
      ),
    mutateAsync: (
      id: string,
      currentStatus = "all",
      currentSort = "newest",
      spotId?: string,
    ) => {
      void currentStatus;
      void currentSort;
      void spotId;
      return mutation.mutateAsync({ id });
    },
  };
}
