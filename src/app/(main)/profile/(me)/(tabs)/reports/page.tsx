import { Metadata } from "next";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { getPriceReportsControllerFindByUserInfiniteQueryOptions } from "@/api/generated/price-reports/price-reports";
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

  // Prefetch infinite query using 'me' as the userId
  const infiniteQueryOptions =
    getPriceReportsControllerFindByUserInfiniteQueryOptions("me", { take: 10 });

  await queryClient.prefetchInfiniteQuery(infiniteQueryOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserReportsInfiniteTab userId="me" />
    </HydrationBoundary>
  );
}
