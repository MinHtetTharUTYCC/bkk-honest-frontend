import { cache } from "react";
import { apiFetch } from "@/lib/api/api-server";
import { unwrapApiSuccessData } from "@/lib/api/api-envelope";
import type { SpotWithStatsResponseDto } from "@/types/api-models";

/**
 * Shared server-side spot fetcher.
 * Uses React `cache()` to deduplicate calls within a single request (e.g. Layout + Page).
 * Automatically handles Supabase Auth headers if a session exists.
 */
export const getSpot = cache(async (citySlug: string, spotSlug: string): Promise<SpotWithStatsResponseDto | null> => {
  try {
    const response = await apiFetch(`/spots/by-slug/${citySlug}/${spotSlug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json();
    const spot = unwrapApiSuccessData<SpotWithStatsResponseDto>(payload);

    if (spot && typeof spot === "object" && "id" in spot) {
      return spot;
    }

    return null;
  } catch (error) {
    console.error(`[getSpot] Error fetching ${citySlug}/${spotSlug}:`, error);
    return null;
  }
});
