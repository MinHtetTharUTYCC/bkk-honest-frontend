import { Metadata } from "next";
import UserReportsInfiniteTab from "@/components/profile/user-reports-infinite-tab";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkhonest.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;

  return {
    title: `${userId}'s Price Reports | BKK Honest`,
    description: `Check out price reports submitted by ${userId} on BKK Honest.`,
    alternates: {
      canonical: `${siteUrl}/profile/${userId}/reports`,
    },
  };
}

export default async function UserReportsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  // Let the client handle auth, loading states, and data fetching.
  return <UserReportsInfiniteTab userId={userId} />;
}
