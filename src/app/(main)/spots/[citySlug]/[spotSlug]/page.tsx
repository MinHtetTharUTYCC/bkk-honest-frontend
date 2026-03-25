import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import SpotDetailClient from "./spot-detail-client";

export const revalidate = 3600;

export async function generateStaticParams() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  try {
    const response = await fetch(`${baseUrl}/spots?take=20`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const json = await response.json();
    const spots = json.data || [];
    return spots.map((spot: unknown) => ({
      citySlug: spot.city?.slug || "bangkok",
      spotSlug: spot.slug,
    }));
  } catch (err) {
    console.error("Failed to generate static params for spots", err);
    return [];
  }
}

export default async function SpotPage({
  params,
}: {
  params: Promise<{ citySlug: string; spotSlug: string }>;
}) {
  const { citySlug, spotSlug } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["spot", citySlug, spotSlug],
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(
        `${baseUrl}/spots/by-slug/${encodeURIComponent(citySlug)}/${encodeURIComponent(spotSlug)}`,
        {
          next: { revalidate: 3600 },
        },
      );
      if (!res.ok) throw new Error("Spot not found");
      const data = await res.json();
      return data?.data || data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SpotDetailClient />
    </HydrationBoundary>
  );
}
