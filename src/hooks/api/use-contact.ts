'use client';

import { useContactControllerSubmitContactForm } from '@/api/generated/contact/contact';

export function useSubmitContactForm() {
    const mutation = useContactControllerSubmitContactForm();
    return {
        ...mutation,
        mutate: (data: { data: { name: string; email: string; subject: string; message: string } }) => mutation.mutate(data),
        mutateAsync: (data: { data: { name: string; email: string; subject: string; message: string } }) => mutation.mutateAsync(data)
    };
}
