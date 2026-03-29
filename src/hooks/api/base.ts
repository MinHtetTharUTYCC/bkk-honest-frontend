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

    const page = lastPage as PaginationLike;
    const source = page.pagination ?? page;
    const skip = source?.skip;
    const take = source?.take;
    const total = source?.total;

    if (typeof skip !== 'number' || typeof take !== 'number' || typeof total !== 'number') {
        return undefined;
    }

    if (requireHasMore && page.pagination?.hasMore === false) {
        return undefined;
    }

    const nextSkip = skip + take;
    return nextSkip < total ? nextSkip : undefined;
}
