import { cache } from "react";
import { spotsControllerFindBySlug } from "@/api/generated/spots/spots";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * Shared server-side spot fetcher.
 * Uses React `cache()` to deduplicate calls within a single request (e.g. Layout + Page).
 * Automatically handles Supabase Auth headers if a session exists.
 */
export const getSpot = cache(async (citySlug: string, spotSlug: string) => {
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

    return res.data;
  } catch (error) {
    console.error(`[getSpot] Error fetching ${citySlug}/${spotSlug}:`, error);
    return null;
  }
});
