import { cache } from "react";
import { profilesControllerFindOne } from "@/api/generated/profiles/profiles";

/**
 * Shared server-side profile fetcher.
 * Uses React `cache()` to deduplicate calls within a single request.
 */
export const getUserProfile = cache(async (userId: string) => {
  try {
    const res = await profilesControllerFindOne(userId, {
      cache: "no-store",
    } as RequestInit);
    
    return res?.data || res;
  } catch (error) {
    console.error(`[getUserProfile] Error fetching profile ${userId}:`, error);
    return null;
  }
});
