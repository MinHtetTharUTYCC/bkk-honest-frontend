import { Metadata } from "next";
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

  // Let the client handle auth, loading states, and data fetching.
  return <UserTipsInfiniteTab userId={userId} />;
}
