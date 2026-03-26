import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import ScamAlertClient from "./scam-alert-client";
import { getScamAlert, getScamAlertComments } from "@/services/scam-alert";

export const revalidate = 3600;

interface StaticAlertParam {
  slug?: string;
  city?: {
    slug?: string;
  };
}

export async function generateStaticParams() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  try {
    const response = await fetch(`${baseUrl}/scam-alerts?take=20`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const json = await response.json();
    const alerts = (json.data || []) as StaticAlertParam[];
    return alerts.map((alert) => ({
      citySlug: alert.city?.slug || "bangkok",
      alertSlug: alert.slug,
    }));
  } catch (err) {
    console.error("Failed to generate static params for scam alerts", err);
    return [];
  }
}

export default async function ScamAlertPage({
  params,
}: {
  params: Promise<{ citySlug: string; alertSlug: string }>;
}) {
  const { citySlug, alertSlug } = await params;
  const queryClient = new QueryClient();

  // Fetch the alert data
  const alert = await getScamAlert(citySlug, alertSlug);

  if (!alert) {
    return <div>Alert not found</div>;
  }

  // Prefetch alert data for hydration
  queryClient.setQueryData(["scam-alert", citySlug, alertSlug], alert);

  // Prefetch first page of comments
  const comments = await getScamAlertComments(alert.id, 0, 10);
  if (comments) {
    queryClient.setQueryData(["scam-comments", alert.id], {
      pages: [comments],
      pageParams: [0],
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ScamAlertClient />
    </HydrationBoundary>
  );
}
