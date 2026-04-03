'use client';

import { useMutation } from '@tanstack/react-query';
import { unwrapApiSuccessData } from '@/lib/api/api-envelope';
import { throwApiError } from '@/lib/errors/throw-api-error';
import { openApiClient } from '@/lib/api/openapi-client';

export function useSubmitContactForm() {
    return useMutation({
        mutationKey: ['contact-submit'],
        mutationFn: async (payload: {
            data: { name: string; email: string; subject: string; message: string };
        }) => {
            const { data, error } = await openApiClient.POST('/contact', {
                body: payload.data,
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<{ success?: boolean; message?: string; id?: string }>(data);
        },
    });
}
