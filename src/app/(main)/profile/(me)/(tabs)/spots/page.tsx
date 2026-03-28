import { Metadata } from "next";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { getSpotsControllerFindByUserInfiniteQueryOptions } from "@/api/generated/spots/spots";
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

  // Prefetch infinite query using 'me' as the userId
  const infiniteQueryOptions = getSpotsControllerFindByUserInfiniteQueryOptions("me", { take: 10 });

  await queryClient.prefetchInfiniteQuery(infiniteQueryOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserSpotsInfiniteTab userId="me" />
    </HydrationBoundary>
  );
}
