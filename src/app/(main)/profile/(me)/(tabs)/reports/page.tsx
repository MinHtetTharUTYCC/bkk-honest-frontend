import { Metadata } from "next";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/api-server";
import { unwrapApiSuccessData } from "@/lib/api/api-envelope";
import type { PaginatedPriceReportsDto } from "@/types/api-models";
import UserReportsInfiniteTab from "@/components/profile/user-reports-infinite-tab";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkhonest.com";

export const metadata: Metadata = {
  title: "Your Price Reports | BKK Honest",
  description: "View all your price reports shared on BKK Honest.",
  alternates: {
    canonical: `${siteUrl}/profile/reports`,
  },
};

export default async function MyReportsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["user-price-reports-infinite", "me"],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const skip = pageParam > 0 ? pageParam : undefined;
      const query = new URLSearchParams();
      query.set("take", "10");
      if (typeof skip === "number") {
        query.set("skip", String(skip));
      }

      const response = await apiFetch(`/price-reports/mine?${query.toString()}`);
      const payload: unknown = await response.json();
      return {
        data: unwrapApiSuccessData<PaginatedPriceReportsDto>(payload),
      };
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserReportsInfiniteTab userId="me" />
    </HydrationBoundary>
  );
}
