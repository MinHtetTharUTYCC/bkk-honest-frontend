import { cache } from "react";
import { apiFetch } from "@/lib/api/api-server";
import { unwrapApiSuccessData } from "@/lib/api/api-envelope";
import type {
  PaginatedCommentsDto,
  CommentsControllerFindByScamAlertParams,
  PaginatedScamAlertsResponseDto,
  ScamAlertsControllerFindAllParams,
  ScamAlertResponseDto,
} from "@/types/api-models";

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      query.append(key, String(value));
    }
  });

  const serialized = query.toString();
  return serialized.length > 0 ? `?${serialized}` : "";
}

/**
 * Shared server-side scam alert fetcher.
 * Uses React `cache()` to deduplicate calls within a single request.
 * Automatically handles Supabase Auth headers if a session exists.
 */
export const getScamAlert = cache(
  async (
    citySlug: string,
    alertSlug: string,
  ): Promise<ScamAlertResponseDto | null> => {
    try {
      const response = await apiFetch(`/scam-alerts/by-slug/${citySlug}/${alertSlug}`, {
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        return null;
      }

      const payload: unknown = await response.json();
      const data = unwrapApiSuccessData<ScamAlertResponseDto>(payload);

      if (data && typeof data === "object" && "id" in data) {
        return data;
      }

      return null;
    } catch (error) {
      console.error(
        `[getScamAlert] Error fetching ${citySlug}/${alertSlug}:`,
        error,
      );
      return null;
    }
  },
);

/**
 * Fetch initial page of alerts for SSR prefetch.
 * Used to load first 10 alerts before hydration.
 */
export const getScamAlertsPage = cache(
  async (
    skip: number = 0,
    take: number = 10,
    params?: ScamAlertsControllerFindAllParams,
  ): Promise<PaginatedScamAlertsResponseDto | null> => {
    try {
      const query = buildQueryString({
        ...(params || {}),
        skip,
        take,
      });

      const response = await apiFetch(`/scam-alerts${query}`, {
        next: { revalidate: 300 },
      });

      if (!response.ok) {
        return null;
      }

      const payload: unknown = await response.json();
      return unwrapApiSuccessData<PaginatedScamAlertsResponseDto>(payload);
    } catch (error) {
      console.error("[getScamAlertsPage] Error fetching alerts:", error);
      return null;
    }
  },
);

/**
 * Fetch initial page of comments for scam alert.
 * Used to load first page before hydration.
 */
export const getScamAlertComments = cache(
  async (
    alertId: string,
    skip: number = 0,
    take: number = 10,
  ): Promise<PaginatedCommentsDto | null> => {
    try {
      const params: CommentsControllerFindByScamAlertParams = { skip, take };
      const query = buildQueryString({
        skip: params.skip,
        take: params.take,
      });

      const response = await apiFetch(`/comments/alert/${alertId}${query}`, {
        next: { revalidate: 300 },
      });

      if (!response.ok) {
        return null;
      }

      const payload: unknown = await response.json();
      return unwrapApiSuccessData<PaginatedCommentsDto>(payload);
    } catch (error) {
      console.error("[getScamAlertComments] Error fetching comments:", error);
      return null;
    }
  },
);
