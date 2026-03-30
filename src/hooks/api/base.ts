/**
 * Shared utilities and types for API hooks.
 */

export type PaginationLike = { 
  pagination?: { 
    skip?: number; 
    take?: number; 
    total?: number; 
    hasMore?: boolean 
  }; 
  skip?: number; 
  take?: number; 
  total?: number 
};

/**
 * Helper to calculate the next skip value for infinite queries.
 */
export function getNextSkipFromPage(lastPage: unknown, requireHasMore = false): number | undefined {
    if (!lastPage || typeof lastPage !== 'object') {
        return undefined;
    }

    // Account for Orval wrapper { data, status, headers }
    const page = (lastPage as Record<string, unknown>).data || lastPage;
    
    const source = (page as Record<string, unknown>).pagination ?? page;
    const skip = (source as Record<string, unknown>)?.skip;
    const take = (source as Record<string, unknown>)?.take;
    const total = (source as Record<string, unknown>)?.total;

    if (typeof skip !== 'number' || typeof take !== 'number' || typeof total !== 'number') {
        return undefined;
    }

    if (requireHasMore && source?.hasMore === false) {
        return undefined;
    }

    const nextSkip = skip + take;
    return nextSkip < total ? nextSkip : undefined;
}
