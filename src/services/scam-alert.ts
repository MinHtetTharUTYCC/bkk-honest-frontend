import { cache } from "react";
import { 
  scamAlertsControllerFindBySlug, 
  scamAlertsControllerFindAll 
} from "@/api/generated/scam-alerts/scam-alerts";
import { commentsControllerFindByScamAlert } from "@/api/generated/comments/comments";

/**
 * Shared server-side scam alert fetcher.
 * Uses React `cache()` to deduplicate calls within a single request.
 * Automatically handles Supabase Auth headers if a session exists.
 */
export const getScamAlert = cache(
  async (citySlug: string, alertSlug: string): Promise<any | null> => {
    try {
      const res = await scamAlertsControllerFindBySlug(citySlug, alertSlug, {
        next: { revalidate: 3600 }
      } as RequestInit);
      return res.data;
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
      const res = await scamAlertsControllerFindAll({
        skip,
        take,
        ...(params?.cityId && { cityId: params.cityId }),
        ...(params?.categoryId && { categoryId: params.categoryId }),
        ...(params?.search && { search: params.search }),
        ...(params?.sort && { sort: params.sort })
      }, { next: { revalidate: 300 } } as RequestInit);
      return res.data;
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
      const res = await commentsControllerFindByScamAlert(alertId, { skip, take }, {
        next: { revalidate: 300 }
      } as RequestInit);
      return res.data;
    } catch (error) {
      console.error("[getScamAlertComments] Error fetching comments:", error);
      return null;
    }
  }
);
