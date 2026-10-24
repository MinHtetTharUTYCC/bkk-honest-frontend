import type { 
  ScamAlertResponseDto, 
  SpotWithStatsResponseDto
} from '@/types/api-models';

/**
 * Normalize voteId from the API response to a string or null
 * The API returns complex objects for voteId, but we need string | null
 */
export function normalizeVoteId(voteId: unknown): string | null {
  if (typeof voteId === 'string') {
    return voteId;
  }
  
  if (voteId && typeof voteId === 'object') {
    // The generated types are { [key: string]: unknown } | null
    // If it's an object, check if it has an id property that's a string
    const objectVoteId = voteId as { [key: string]: unknown };
    if (typeof objectVoteId.id === 'string') {
      return objectVoteId.id;
    }
  }
  
  return null;
}

/**
 * Convert ScamAlertResponseDto to a format expected by ScamAlertCard
 */
export function normalizeScamAlert(alert: ScamAlertResponseDto): Omit<ScamAlertResponseDto, 'voteId'> & { voteId?: string | null } {
  return {
    ...alert,
    voteId: normalizeVoteId(alert.voteId)
  };
}

/**
 * Convert SpotWithStatsResponseDto to have normalized voteId
 */
export function normalizeSpot(spot: SpotWithStatsResponseDto): Omit<SpotWithStatsResponseDto, 'voteId'> & { voteId?: string | null } {
  return {
    ...spot,
    voteId: normalizeVoteId(spot.voteId)
  };
}

// Type for ScamAlertData that matches what ScamAlertCard expects
export type NormalizedScamAlert = Omit<ScamAlertResponseDto, 'voteId'> & { 
  voteId?: string | null;
  userId?: string;
  categoryId?: string;
  cityId?: string;
};