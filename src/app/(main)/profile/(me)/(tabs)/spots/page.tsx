import { Metadata } from "next";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/api-server";
import { unwrapApiSuccessData } from "@/lib/api/api-envelope";
import type { PaginatedSpotsWithStatsResponseDto } from "@/types/api-models";
import UserSpotsInfiniteTab from "@/components/profile/user-spots-infinite-tab";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkhonest.com";

export const metadata: Metadata = {
  title: "Your Spots | BKK Honest",
  description: "View all your spots shared on BKK Honest.",
  alternates: {
    canonical: `${siteUrl}/profile/spots`,
  },
};

export default async function MySpotsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["user-spots-infinite", "me"],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const skip = pageParam > 0 ? pageParam : undefined;
      const query = new URLSearchParams();
      query.set("take", "10");
      if (typeof skip === "number") {
        query.set("skip", String(skip));
      }

      const response = await apiFetch(`/spots/mine?${query.toString()}`);
      const payload: unknown = await response.json();
      return {
        data: unwrapApiSuccessData<PaginatedSpotsWithStatsResponseDto>(payload),
      };
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserSpotsInfiniteTab userId="me" />
    </HydrationBoundary>
  );
}
