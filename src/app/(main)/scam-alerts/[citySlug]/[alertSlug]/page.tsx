import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import ScamAlertClient from "./scam-alert-client";

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

  await queryClient.prefetchQuery({
    queryKey: ["scam-alert", citySlug, alertSlug],
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(
        `${baseUrl}/scam-alerts/by-slug/${encodeURIComponent(citySlug)}/${encodeURIComponent(alertSlug)}`,
        {
          next: { revalidate: 3600 },
        },
      );
      if (!res.ok) throw new Error("Alert not found");
      const data = await res.json();
      return data?.data || data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ScamAlertClient />
    </HydrationBoundary>
  );
}
