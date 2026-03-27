import { cache } from "react";
import { spotsControllerFindBySlug } from "@/api/generated/spots/spots";

/**
 * Shared server-side spot fetcher.
 * Uses React `cache()` to deduplicate calls within a single request (e.g. Layout + Page).
 * Automatically handles Supabase Auth headers if a session exists.
 */
export const getSpot = cache(async (citySlug: string, spotSlug: string) => {
  try {
    const res = await spotsControllerFindBySlug(citySlug, spotSlug, {
      cache: "no-store",
    } as RequestInit);
    
    return res.data;
  } catch (error) {
    console.error(`[getSpot] Error fetching ${citySlug}/${spotSlug}:`, error);
    return null;
  }
});
