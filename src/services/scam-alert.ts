import { cache } from "react";
import type {
  commentsControllerFindByScamAlertResponse,
} from "@/api/generated/comments/comments";
import type {
  scamAlertsControllerFindAllResponse,
  scamAlertsControllerFindBySlugResponse,
} from "@/api/generated/scam-alerts/scam-alerts";
import type {
  CommentsControllerFindByScamAlertParams,
  ScamAlertsControllerFindAllParams,
} from "@/api/generated/model";
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
  async (citySlug: string, alertSlug: string): Promise<scamAlertsControllerFindBySlugResponse['data'] | null> => {
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
  async (skip: number = 0, take: number = 10, params?: ScamAlertsControllerFindAllParams): Promise<scamAlertsControllerFindAllResponse['data'] | null> => {
    try {
      const res = await scamAlertsControllerFindAll({
        ...params,
        skip,
        take,
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
  async (alertId: string, skip: number = 0, take: number = 10): Promise<commentsControllerFindByScamAlertResponse['data'] | null> => {
    try {
      const params: CommentsControllerFindByScamAlertParams = { skip, take };
      const res = await commentsControllerFindByScamAlert(alertId, params, {
        next: { revalidate: 300 }
      } as RequestInit);
      return res.data;
    } catch (error) {
      console.error("[getScamAlertComments] Error fetching comments:", error);
      return null;
    }
  }
);
