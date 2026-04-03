import { Metadata } from "next";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/api-server";
import { unwrapApiSuccessData } from "@/lib/api/api-envelope";
import type { PaginatedScamAlertsResponseDto } from "@/types/api-models";
import UserScamsInfiniteTab from "@/components/profile/user-scams-infinite-tab";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkhonest.com";

export const metadata: Metadata = {
  title: "Your Scam Alerts | BKK Honest",
  description: "View all your scam alerts reported on BKK Honest.",
  alternates: {
    canonical: `${siteUrl}/profile/scams`,
  },
};

export default async function MyScamsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["user-scam-alerts-infinite", "me"],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const skip = pageParam > 0 ? pageParam : undefined;
      const query = new URLSearchParams();
      query.set("take", "10");
      if (typeof skip === "number") {
        query.set("skip", String(skip));
      }

      const response = await apiFetch(`/scam-alerts/mine?${query.toString()}`);
      const payload: unknown = await response.json();
      return {
        data: unwrapApiSuccessData<PaginatedScamAlertsResponseDto>(payload),
      };
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserScamsInfiniteTab userId="me" />
    </HydrationBoundary>
  );
}
