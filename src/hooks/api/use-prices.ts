"use client";

import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { unwrapApiSuccessData } from "@/lib/api/api-envelope";
import { throwApiError } from "@/lib/errors/throw-api-error";
import { openApiClient } from "@/lib/api/openapi-client";
import type { PaginatedPriceReportsDto, PriceReportDto } from "@/types/api-models";
import { getNextSkipFromPage } from "./base";

export function useSpotPriceReports(spotId: string) {
  const query = useQuery({
    queryKey: ["spot-price-reports", spotId],
    enabled: !!spotId,
    queryFn: async () => {
      const { data, error } = await openApiClient.GET("/price-reports/spot/{spotId}", {
        params: { path: { spotId } },
      });

      if (error) {
        throwApiError(error);
      }

      return unwrapApiSuccessData<PaginatedPriceReportsDto>(data);
    },
  });
  return { ...query, data: query.data || [] };
}

export function useInfiniteSpotPriceReports(spotId: string) {
  return useInfiniteQuery({
    queryKey: ["price-reports-infinite", spotId],
    queryFn: async ({ pageParam = 0 }) => {
      const skip = pageParam > 0 ? pageParam : undefined;
      const { data, error } = await openApiClient.GET("/price-reports/spot/{spotId}", {
        params: { path: { spotId }, query: { take: 10, skip } },
      });

      if (error) {
        throwApiError(error);
      }

      return {
        data: unwrapApiSuccessData<PaginatedPriceReportsDto>(data),
      };
    },
    getNextPageParam: (lastPage: unknown) => {
      const pageData =
        typeof lastPage === "object" && lastPage !== null && "data" in lastPage
          ? (lastPage as { data: unknown }).data
          : lastPage;
      return getNextSkipFromPage(pageData, false);
    },
    enabled: !!spotId,
    initialPageParam: 0,
  });
}

export function useCreatePriceReport() {
  return useMutation({
    mutationKey: ["price-reports-create"],
    mutationFn: async (payload: { spotId: string; itemName: string; priceThb: number }) => {
      const { data, error } = await openApiClient.POST("/price-reports", {
        body: payload,
      });

      if (error) {
        throwApiError(error);
      }

      return unwrapApiSuccessData<PriceReportDto>(data);
    },
  });
}
