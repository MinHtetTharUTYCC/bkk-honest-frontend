import { cache } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ProfileResponseDto } from "@/types/api-models";
import { unwrapApiSuccessData } from "@/lib/api/api-envelope";
import { throwApiError } from "@/lib/errors/throw-api-error";
import { openApiClient } from "@/lib/api/openapi-client";
import { apiFetch } from "@/lib/api/api-server";

/**
 * Shared server-side profile fetcher.
 * Uses React `cache()` to deduplicate calls within a single request.
 * 
 * Fetches profile by user ID using the generated react-query hook.
 */
export const getUserProfile = cache(async (userId: string) => {
  try {
    const response = await apiFetch(`/profiles/${userId}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json();
    return unwrapApiSuccessData<ProfileResponseDto>(payload);
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
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await openApiClient.GET("/profiles/{id}", {
        params: { path: { id: userId as string } },
      });

      if (error) {
        throwApiError(error);
      }

      return unwrapApiSuccessData<ProfileResponseDto>(data);
    },
  });
}
