import { cache } from "react";
import { spotsControllerFindBySlug } from "@/api/generated/spots/spots";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { SpotWithStatsResponseDto } from "@/api/generated/model";

/**
 * Shared server-side spot fetcher.
 * Uses React `cache()` to deduplicate calls within a single request (e.g. Layout + Page).
 * Automatically handles Supabase Auth headers if a session exists.
 */
export const getSpot = cache(async (citySlug: string, spotSlug: string): Promise<SpotWithStatsResponseDto | null> => {
  console.log('[getSpot] Fetching slug:', `${citySlug}/${spotSlug}`);
  try {
    const supabase = await createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const headers = session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {};

    const res = await spotsControllerFindBySlug(citySlug, spotSlug, {
      cache: "no-store",
      headers,
    } as RequestInit);

    console.log('[getSpot] Response:', res ? 'exists' : 'null');
    console.log('[getSpot] Response.data:', res?.data ? 'exists' : 'null');
    console.log('[getSpot] Has id?:', res?.data && "id" in res.data);

    if (res && res.data && typeof res.data === "object" && "id" in res.data) {
      console.log('[getSpot] SUCCESS - Returning spot:', res.data.id);
      return res.data as SpotWithStatsResponseDto;
    }
    console.log('[getSpot] FAILED - Returning null');
    return null;
  } catch (error) {
    console.error(`[getSpot] Error fetching ${citySlug}/${spotSlug}:`, error);
    return null;
  }
});
