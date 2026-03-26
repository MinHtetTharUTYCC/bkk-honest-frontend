import { SpotData } from "@/types/spot";
import { cache } from "react";
import { apiFetch } from "@/lib/api-server";

/**
 * Shared server-side spot fetcher.
 * Uses React `cache()` to deduplicate calls within a single request (e.g. Layout + Page).
 * Automatically handles Supabase Auth headers if a session exists.
 */
export const getSpot = cache(async (citySlug: string, spotSlug: string): Promise<SpotData | null> => {
  try {
    const res = await apiFetch(`/spots/by-slug/${encodeURIComponent(citySlug)}/${encodeURIComponent(spotSlug)}`, {
      cache: "no-store", // Request-level deduplication via React cache()
    });
    
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json;
  } catch (error) {
    console.error(`[getSpot] Error fetching ${citySlug}/${spotSlug}:`, error);
    return null;
  }
});
