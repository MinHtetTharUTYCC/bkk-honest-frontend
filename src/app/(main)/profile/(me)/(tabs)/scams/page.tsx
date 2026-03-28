import { Metadata } from "next";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { getScamAlertsControllerFindByUserInfiniteQueryOptions } from "@/api/generated/scam-alerts/scam-alerts";
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

  // Prefetch infinite query using 'me' as the userId
  const infiniteQueryOptions = getScamAlertsControllerFindByUserInfiniteQueryOptions("me", { take: 10 });

  await queryClient.prefetchInfiniteQuery(infiniteQueryOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserScamsInfiniteTab userId="me" />
    </HydrationBoundary>
  );
}
