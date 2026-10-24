export type ApiPagination = {
    skip: number;
    take: number;
    total: number;
    hasMore: boolean;
};

export type ApiSuccessEnvelope<T> = {
    success: true;
    statusCode: number;
    timestamp: string;
    requestId?: string;
    message?: string;
    data?: T;
    pagination?: ApiPagination;
};

export type ApiErrorEnvelope = {
    success: false;
    statusCode: number;
    timestamp: string;
    requestId?: string;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
};

export type LegacyApiSuccessEnvelope<T> = {
    status: number;
    data: T;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === 'object' && value !== null;
}

export function isApiSuccessEnvelope<T>(value: unknown): value is ApiSuccessEnvelope<T> {
    if (!isRecord(value)) {
        return false;
    }

    return value.success === true && typeof value.statusCode === 'number';
}

export function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
    if (!isRecord(value)) {
        return false;
    }

    if (value.success !== false || typeof value.statusCode !== 'number') {
        return false;
    }

    const error = value.error;
    return isRecord(error) && typeof error.code === 'string' && typeof error.message === 'string';
}

function isLegacyApiSuccessEnvelope<T>(value: unknown): value is LegacyApiSuccessEnvelope<T> {
    if (!isRecord(value)) {
        return false;
    }

    return typeof value.status === 'number' && 'data' in value;
}

export function unwrapApiSuccessData<T>(value: unknown): T {
    if (isApiSuccessEnvelope<T>(value)) {
        // If the envelope has pagination, reconstruct the full paginated response
        if (value.pagination && isRecord(value.data)) {
            return {
                data: value.data,
                pagination: value.pagination,
            } as T;
        }
        // Otherwise, return just the data or the full envelope as fallback
        return (value.data ?? value) as T;
    }

    if (isLegacyApiSuccessEnvelope<T>(value)) {
        return value.data;
    }

    return value as T;
}

export type NormalizedApiError = {
    message: string;
    statusCode?: number;
    code?: string;
    details?: unknown;
    requestId?: string;
    timestamp?: string;
    raw: unknown;
};

export function extractApiError(error: unknown): NormalizedApiError {
    const fallbackMessage = error instanceof Error ? error.message : 'Something went wrong';

    if (!isRecord(error)) {
        return {
            message: fallbackMessage,
            raw: error,
        };
    }

    const response = error.response;
    const payload = isRecord(response) ? response.data : undefined;

    if (isApiErrorEnvelope(payload)) {
        return {
            message: payload.error.message,
            statusCode: payload.statusCode,
            code: payload.error.code,
            details: payload.error.details,
            requestId: payload.requestId,
            timestamp: payload.timestamp,
            raw: error,
        };
    }

    const messageFromPayload =
        isRecord(payload) && typeof payload.message === 'string' ? payload.message : undefined;

    return {
        message: messageFromPayload ?? fallbackMessage,
        statusCode:
            isRecord(response) && typeof response.status === 'number' ? response.status : undefined,
        raw: error,
    };
}
