import { Metadata } from "next";
import UserScamsInfiniteTab from "@/components/profile/user-scams-infinite-tab";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkhonest.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;

  return {
    title: `${userId}'s Scam Alerts | BKK Honest`,
    description: `Check out scam alerts reported by ${userId} on BKK Honest.`,
    alternates: {
      canonical: `${siteUrl}/profile/${userId}/scams`,
    },
  };
}

export default async function UserScamsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  // Let the client handle auth, loading states, and data fetching.
  return <UserScamsInfiniteTab userId={userId} />;
}
