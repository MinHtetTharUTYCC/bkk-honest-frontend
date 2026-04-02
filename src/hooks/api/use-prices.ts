"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  usePriceReportsControllerFindBySpot,
  usePriceReportsControllerCreate,
  priceReportsControllerFindBySpot,
} from "@/api/generated/price-reports/price-reports";
import { getNextSkipFromPage } from "./base";

export function useSpotPriceReports(spotId: string) {
  const query = usePriceReportsControllerFindBySpot(spotId, undefined, {
    query: { enabled: !!spotId },
  });
  return { ...query, data: query.data || [] };
}

export function useInfiniteSpotPriceReports(spotId: string) {
  return useInfiniteQuery({
    queryKey: ["price-reports-infinite", spotId],
    queryFn: async ({ pageParam = 0 }) => {
      const skip = pageParam > 0 ? pageParam : undefined;
      return priceReportsControllerFindBySpot(spotId, { take: 10, skip });
    },
    getNextPageParam: (lastPage: unknown) =>
      getNextSkipFromPage(lastPage, false),
    enabled: !!spotId,
    initialPageParam: 0,
  });
}

export function useCreatePriceReport() {
  const mutation = usePriceReportsControllerCreate();
  return {
    ...mutation,
    mutate: (payload: { spotId: string; itemName: string; priceThb: number }) =>
      mutation.mutate({ data: payload }),
    mutateAsync: (payload: {
      spotId: string;
      itemName: string;
      priceThb: number;
    }) => mutation.mutateAsync({ data: payload }),
  };
}
