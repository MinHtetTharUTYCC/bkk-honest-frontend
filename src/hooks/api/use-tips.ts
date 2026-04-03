"use client";

import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { unwrapApiSuccessData } from "@/lib/api/api-envelope";
import { throwApiError } from "@/lib/errors/throw-api-error";
import { openApiClient } from "@/lib/api/openapi-client";
import type {
  CommunityTipResponseDto,
  MessageResponseDto,
  PaginatedCommunityTipsResponseDto,
} from "@/types/api-models";
import { getNextSkipFromPage } from "./base";

export function useSpotTips(spotId: string) {
  const params = { type: "TRY" as const, sort: "popular" as const };
  const query = useQuery({
    queryKey: ["spot-tips", spotId, params.type, params.sort],
    enabled: !!spotId,
    queryFn: async () => {
      const { data, error } = await openApiClient.GET("/community-tips/spot/{spotId}", {
        params: { path: { spotId }, query: params },
      });

      if (error) {
        throwApiError(error);
      }

      return unwrapApiSuccessData<PaginatedCommunityTipsResponseDto>(data);
    },
  });
  return { ...query, data: query.data || [] };
}

export function useInfiniteSpotTips(
  spotId: string,
  type: "TRY" | "AVOID",
  sort: "newest" | "popular" = "popular",
) {
  const normalizedType = type === "TRY" ? "TRY" : "AVOID";

  const normalizedSort = sort === "popular" ? "popular" : "newest";

  return useInfiniteQuery({
    queryKey: ["tips-infinite", spotId, normalizedType, normalizedSort],
    queryFn: async ({ pageParam = 0 }) => {
      const skip = pageParam > 0 ? pageParam : undefined;
      const { data, error } = await openApiClient.GET("/community-tips/spot/{spotId}", {
        params: {
          path: { spotId },
          query: {
            type: normalizedType,
            sort: normalizedSort,
            take: 10,
            skip,
          },
        },
      });

      if (error) {
        throwApiError(error);
      }

      return {
        data: unwrapApiSuccessData<PaginatedCommunityTipsResponseDto>(data),
      };
    },
    staleTime: 5 * 60 * 1000,
    getNextPageParam: (lastPage: unknown) => {
      const pageData =
        typeof lastPage === "object" && lastPage !== null && "data" in lastPage
          ? (lastPage as { data: unknown }).data
          : lastPage;
      return getNextSkipFromPage(pageData, true);
    },
    initialPageParam: 0,
  });
}

export function useCreateCommunityTip() {
  return useMutation({
    mutationKey: ["community-tips-create"],
    mutationFn: async (payload: {
      spotId: string;
      type: "TRY" | "AVOID";
      title: string;
      description: string;
    }) => {
      const { data, error } = await openApiClient.POST("/community-tips", {
        body: payload,
      });

      if (error) {
        throwApiError(error);
      }

      return unwrapApiSuccessData<CommunityTipResponseDto>(data);
    },
  });
}

export function useUpdateCommunityTip() {
  return useMutation({
    mutationKey: ["community-tips-update"],
    mutationFn: async (payload: {
      id: string;
      spotId: string;
      type?: "TRY" | "AVOID";
      title?: string;
      description?: string;
    }) => {
      const { id, ...data } = payload;
      const { data: responseData, error } = await openApiClient.PATCH("/community-tips/{id}", {
        params: { path: { id } },
        body: data,
      });

      if (error) {
        throwApiError(error);
      }

      return unwrapApiSuccessData<CommunityTipResponseDto>(responseData);
    },
  });
}

export function useDeleteCommunityTip() {
  return useMutation({
    mutationKey: ["community-tips-delete"],
    mutationFn: async ({ id }: { id: string; _spotId: string }) => {
      const { data, error } = await openApiClient.DELETE("/community-tips/{id}", {
        params: { path: { id } },
      });

      if (error) {
        throwApiError(error);
      }

      return unwrapApiSuccessData<MessageResponseDto>(data);
    },
  });
}
