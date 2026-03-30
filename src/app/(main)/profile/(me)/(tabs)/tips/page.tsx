import { Metadata } from "next";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { getCommunityTipsControllerFindByUserInfiniteQueryOptions } from "@/api/generated/community-tips/community-tips";
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

  // Prefetch infinite query using 'me' as the userId
  const infiniteQueryOptions =
    getCommunityTipsControllerFindByUserInfiniteQueryOptions("me", {
      take: 10,
    });

  await queryClient.prefetchInfiniteQuery(infiniteQueryOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserTipsInfiniteTab userId="me" />
    </HydrationBoundary>
  );
}
