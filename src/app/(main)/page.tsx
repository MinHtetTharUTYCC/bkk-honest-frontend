import { Suspense } from "react";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import HomeFeedClient from "@/components/home/home-feed-client";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function fetchApi(
  path: string,
  params?: Record<string, string | number | undefined>,
) {
  const url = new URL(path, apiBaseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), { next: { revalidate: 3600 } }); // Increased revalidate to 1 hour for metadata
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }
  return response.json();
}

async function HomeFeedPrefetched() {
  const queryClient = new QueryClient();

  // Prefetch metadata with 24 hour staleTime match
  await queryClient.prefetchQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const data = await fetchApi("/cities");
      return Array.isArray(data) ? data : data?.data || [];
    },
    staleTime: 24 * 60 * 60 * 1000,
  });

  const cities = (queryClient.getQueryData(["cities"]) as any[]) || [];
  const bangkok = cities.find(
    (city: any) => city?.name?.toLowerCase() === "bangkok",
  );
  const selectedCity = bangkok || cities[0];
  const selectedCityId = selectedCity?.id;
  const fallbackCityName = selectedCity?.name || "Thailand";

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["categories"],
      queryFn: async () => {
        const data = await fetchApi("/categories");
        return Array.isArray(data) ? data : data?.data || [];
      },
      staleTime: 24 * 60 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ["leaderboard", 5],
      queryFn: async () => {
        const data = await fetchApi("/profiles/leaderboard/top", { take: 5 });
        return data?.data || data;
      },
      staleTime: 5 * 60 * 1000,
    }),
    selectedCityId
      ? queryClient.prefetchQuery({
          queryKey: ["spots", { cityId: selectedCityId, sort: "popular" }],
          queryFn: async () => {
            const data = await fetchApi("/spots", {
              cityId: selectedCityId,
              sort: "popular",
            });
            return data?.data || (Array.isArray(data) ? data : []);
          },
          staleTime: 5 * 60 * 1000,
        })
      : Promise.resolve(),
    selectedCityId
      ? queryClient.prefetchQuery({
          queryKey: ["scam-alerts", { cityId: selectedCityId, take: 5 }],
          queryFn: async () => {
            const data = await fetchApi("/scam-alerts", {
              cityId: selectedCityId,
              take: 5,
            });
            return data?.data || (Array.isArray(data) ? data : []);
          },
          staleTime: 5 * 60 * 1000,
        })
      : Promise.resolve(),
    selectedCityId
      ? queryClient.prefetchQuery({
          queryKey: ["live-vibes", { cityId: selectedCityId, take: 5 }],
          queryFn: async () => {
            const query = await fetchApi("/live-vibes", {
              cityId: selectedCityId,
              take: 5,
            });
            return query?.data || (Array.isArray(query) ? query : []);
          },
          staleTime: 1 * 60 * 1000,
        })
      : Promise.resolve(),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeFeedClient fallbackCityName={fallbackCityName} />
    </HydrationBoundary>
  );
}

function HomeFeedFallback() {
  return (
    <div className="space-y-8">
      <div className="h-10 w-56 rounded-xl bg-white/5 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-80 rounded-2xl bg-white/5 animate-pulse" />
        <div className="h-80 rounded-2xl bg-white/5 animate-pulse" />
      </div>
      <div className="h-10 w-48 rounded-xl bg-white/5 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-56 rounded-2xl bg-white/5 animate-pulse" />
        <div className="h-56 rounded-2xl bg-white/5 animate-pulse" />
        <div className="h-56 rounded-2xl bg-white/5 animate-pulse" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFeedFallback />}>
      <HomeFeedPrefetched />
    </Suspense>
  );
}
