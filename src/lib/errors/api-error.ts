import { BadRequestErrorDto } from '@/api/generated/model/badRequestErrorDto';

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
    const error = err as { response?: { data?: BadRequestErrorDto } };
    const message = error.response?.data?.error?.message;
    return Array.isArray(message) ? message[0] : (message ?? fallback);
}
