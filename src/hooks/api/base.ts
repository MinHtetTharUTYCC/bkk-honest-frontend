/**
 * Shared utilities and types for API hooks.
 */

export type PaginationLike = {
    pagination?: {
        skip?: number;
        take?: number;
        total?: number;
        hasMore?: boolean;
    };
    skip?: number;
    take?: number;
    total?: number;
};

/**
 * Helper to calculate the next skip value for infinite queries.
 */
export function getNextSkipFromPage(lastPage: unknown, requireMore?: boolean): number | undefined {
    if (!lastPage || typeof lastPage !== 'object') {
        return undefined;
    }

    // Mutator already unwraps the response envelope
    const page = lastPage;

    const source = (page as Record<string, unknown>).pagination ?? page;
    const skip = (source as Record<string, unknown>)?.skip;
    const take = (source as Record<string, unknown>)?.take;
    const total = (source as Record<string, unknown>)?.total;

    if (typeof skip !== 'number' || typeof take !== 'number' || typeof total !== 'number') {
        return undefined;
    }

    const nextSkip = skip != null ? skip + take : undefined;
    return nextSkip != null && nextSkip < total ? nextSkip : undefined;
}
