import type { Metadata } from "next";
import ScamAlertsPageClient from "@/components/scams/scam-alerts-page-client";

type ScamAlertsPageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: "newest" | "popular";
  }>;
};

export async function generateMetadata({
  searchParams,
}: ScamAlertsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q?.trim();
  const sort = params.sort === "popular" ? "popular" : "newest";
  const path = "/scam-alerts";

  if (query) {
    return {
      title: `Scam Alerts for "${query}" | BKK Honest`,
      description: `Browse recent and community-verified scam alerts related to "${query}" in Bangkok and Thailand.`,
      alternates: {
        canonical: path,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }

  return {
    title: `Scam Alerts (${sort === "popular" ? "Popular" : "Latest"}) | BKK Honest`,
    description:
      "Real-time scam alerts shared by the community in Bangkok and across Thailand.",
    alternates: {
      canonical: path,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

import { Suspense } from "react";

export default function ScamAlertsPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse h-screen bg-white/5 rounded-2xl m-4" />
      }
    >
      <ScamAlertsPageClient />
    </Suspense>
  );
}
