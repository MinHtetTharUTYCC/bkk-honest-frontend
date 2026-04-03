import { toast } from 'sonner';
import { extractApiError } from '@/lib/api/api-envelope';

/**
 * Custom error class to store structured API error details.
 */
export class ApiError extends Error {
    public readonly statusCode?: number;
    public readonly code?: string;
    public readonly details?: unknown;
    public readonly requestId?: string;
    public readonly timestamp?: string;

    constructor(message: string, options?: {
        statusCode?: number;
        code?: string;
        details?: unknown;
        requestId?: string;
        timestamp?: string;
    }) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = options?.statusCode;
        this.code = options?.code;
        this.details = options?.details;
        this.requestId = options?.requestId;
        this.timestamp = options?.timestamp;
    }
}

/**
 * Normalizes and throws an API error with structured data.
 * Used throughout hooks and services for error handling.
 */
export function throwApiError(error: unknown): never {
    const normalized = extractApiError(error);
    
    throw new ApiError(normalized.message, {
        statusCode: normalized.statusCode,
        code: normalized.code,
        details: normalized.details,
        requestId: normalized.requestId,
        timestamp: normalized.timestamp,
    });
}

/**
 * Helper to display an error message in a toast.
 * Extracts message from Error or ApiError.
 */
export function toastApiError(err: unknown, fallback = 'Something went wrong') {
    const message = err instanceof Error ? err.message : fallback;
    toast.error(message);
}


