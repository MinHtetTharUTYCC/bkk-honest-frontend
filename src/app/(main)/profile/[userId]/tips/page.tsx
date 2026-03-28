import { Metadata } from "next";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { getUserProfile } from "@/services/profile";
import { communityTipsControllerFindByUser } from "@/api/generated/community-tips/community-tips";
import UserTipsInfiniteTab from "@/components/profile/user-tips-infinite-tab";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkhonest.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;

  return {
    title: `${userId}'s Community Tips | BKK Honest`,
    description: `Check out community tips shared by ${userId} on BKK Honest.`,
    alternates: {
      canonical: `${siteUrl}/profile/${userId}/tips`,
    },
  };
}

export default async function UserTipsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  // Fetch user profile to ensure user exists
  let user;
  try {
    const response = await getUserProfile(userId);
    user = response?.data || response;
  } catch (error) {
    return <div>User not found</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  const queryClient = new QueryClient();

  // Prefetch infinite query with initial data
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["user-tips-infinite", userId],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const res = await communityTipsControllerFindByUser(userId, {
        skip: pageParam.toString(),
        take: 10,
      }, { next: { revalidate: 60 } } as RequestInit);
      return res;
    },
    getNextPageParam: (lastPage: any) => {
      const { skip, take, total } = lastPage.pagination || {};
      if (skip === undefined || take === undefined || total === undefined)
        return undefined;
      const nextSkip = skip + take;
      return nextSkip < total ? nextSkip : undefined;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserTipsInfiniteTab userId={userId} />
    </HydrationBoundary>
  );
}
