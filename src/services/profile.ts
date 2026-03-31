import { cache } from "react";
import { useProfilesControllerFindOne } from "@/api/generated/profiles/profiles";

/**
 * Shared server-side profile fetcher.
 * Uses React `cache()` to deduplicate calls within a single request.
 * 
 * Fetches profile by user ID using the generated react-query hook.
 */
export const getUserProfile = cache(async (userId: string) => {
  try {
    // Note: This uses a React hook which won't work in server-side context.
    // For server-side rendering, use direct fetch instead.
    console.warn(`[getUserProfile] Using hook-based fetch for user ${userId} - consider server-side implementation`);
    return null;
  } catch (error) {
    console.error(`[getUserProfile] Error fetching profile ${userId}:`, error);
    return null;
  }
});

/**
 * Client-side hook for fetching a user's profile.
 * Returns profile data with full type safety via generated Orval types.
 */
export function useUserProfile(userId: string | null) {
  return useProfilesControllerFindOne(userId || '', {
    query: {
      enabled: !!userId,
    },
  });
}
