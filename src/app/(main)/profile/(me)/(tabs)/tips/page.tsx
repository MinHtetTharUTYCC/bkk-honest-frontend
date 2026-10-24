import { Metadata } from "next";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/api-server";
import { unwrapApiSuccessData } from "@/lib/api/api-envelope";
import type { PaginatedCommunityTipsResponseDto } from "@/types/api-models";
import UserTipsInfiniteTab from "@/components/profile/user-tips-infinite-tab";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkhonest.com";

export const metadata: Metadata = {
  title: "Your Community Tips | BKK Honest",
  description: "View all your community tips shared on BKK Honest.",
  alternates: {
    canonical: `${siteUrl}/profile/tips`,
  },
};

export default async function MyTipsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["user-community-tips-infinite", "me"],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const skip = pageParam > 0 ? pageParam : undefined;
      const query = new URLSearchParams();
      query.set("take", "10");
      if (typeof skip === "number") {
        query.set("skip", String(skip));
      }

      const response = await apiFetch(`/community-tips/mine?${query.toString()}`);
      const payload: unknown = await response.json();
      return {
        data: unwrapApiSuccessData<PaginatedCommunityTipsResponseDto>(payload),
      };
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserTipsInfiniteTab userId="me" />
    </HydrationBoundary>
  );
}
