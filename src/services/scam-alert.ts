import { cache } from "react";
import { apiFetch } from "@/lib/api-server";

/**
 * Shared server-side scam alert fetcher.
 * Uses React `cache()` to deduplicate calls within a single request.
 * Automatically handles Supabase Auth headers if a session exists.
 */
export const getScamAlert = cache(
  async (citySlug: string, alertSlug: string): Promise<any | null> => {
    try {
      const res = await apiFetch(
        `/scam-alerts/by-slug/${encodeURIComponent(citySlug)}/${encodeURIComponent(alertSlug)}`,
        { next: { revalidate: 3600 } }
      );

      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || json;
    } catch (error) {
      console.error(
        `[getScamAlert] Error fetching ${citySlug}/${alertSlug}:`,
        error
      );
      return null;
    }
  }
);

/**
 * Fetch initial page of alerts for SSR prefetch.
 * Used to load first 10 alerts before hydration.
 */
export const getScamAlertsPage = cache(
  async (skip: number = 0, take: number = 10, params?: any): Promise<any | null> => {
    try {
      const queryParams = new URLSearchParams({
        skip: skip.toString(),
        take: take.toString(),
      });

      if (params?.cityId) {
        queryParams.append("cityId", params.cityId);
      }
      if (params?.categoryId) {
        queryParams.append("categoryId", params.categoryId);
      }
      if (params?.search) {
        queryParams.append("search", params.search);
      }
      if (params?.sort) {
        queryParams.append("sort", params.sort);
      }

      const res = await apiFetch(`/scam-alerts?${queryParams}`, {
        next: { revalidate: 300 },
      });

      if (!res.ok) return null;
      const json = await res.json();
      return json;
    } catch (error) {
      console.error("[getScamAlertsPage] Error fetching alerts:", error);
      return null;
    }
  }
);

/**
 * Fetch initial page of comments for scam alert.
 * Used to load first page before hydration.
 */
export const getScamAlertComments = cache(
  async (alertId: string, skip: number = 0, take: number = 10): Promise<any | null> => {
    try {
      const res = await apiFetch(
        `/comments/alert/${alertId}?skip=${skip}&take=${take}`,
        { next: { revalidate: 300 } }
      );

      if (!res.ok) return null;
      const json = await res.json();
      return json;
    } catch (error) {
      console.error("[getScamAlertComments] Error fetching comments:", error);
      return null;
    }
  }
);
