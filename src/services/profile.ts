import { cache } from "react";

/**
 * Shared server-side profile fetcher.
 * Uses React `cache()` to deduplicate calls within a single request.
 * 
 * Note: Backend doesn't have a GET profile by ID endpoint yet.
 * To be implemented when backend adds this endpoint.
 */
export const getUserProfile = cache(async (userId: string) => {
  try {
    // TODO: Implement when backend adds GET /profiles/:id endpoint
    console.warn(`[getUserProfile] Profile fetch not yet implemented for user ${userId}`);
    return null;
  } catch (error) {
    console.error(`[getUserProfile] Error fetching profile ${userId}:`, error);
    return null;
  }
});
