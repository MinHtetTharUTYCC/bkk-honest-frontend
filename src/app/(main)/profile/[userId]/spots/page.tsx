import { Metadata } from "next";
import UserSpotsInfiniteTab from "@/components/profile/user-spots-infinite-tab";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkhonest.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;

  return {
    title: `${userId}'s Spots | BKK Honest`,
    description: `Check out spots visited and reviewed by ${userId} on BKK Honest.`,
    alternates: {
      canonical: `${siteUrl}/profile/${userId}/spots`,
    },
  };
}

export default async function UserSpotsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  // Let the client handle auth, loading states, and data fetching.
  return <UserSpotsInfiniteTab userId={userId} />;
}
