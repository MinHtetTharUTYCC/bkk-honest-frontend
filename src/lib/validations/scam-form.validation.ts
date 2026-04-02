import { z } from 'zod';

export const scamFormValidation = z.object({
    scamCity: z.string().min(1, 'Please select a city'),
    scamName: z
        .string()
        .min(1, 'Scam name is required')
        .max(100, 'Scam name cannot exceed 100 characters'),
    scamDescription: z
        .string()
        .min(1, 'Description is required')
        .max(500, 'Description cannot exceed 500 characters'),
    scamPreventionTip: z
        .string()
        .min(1, 'Prevention tip is required')
        .max(300, 'Prevention tip cannot exceed 300 characters'),
    scamCategory: z.string().min(1, 'Please select a category'),
    scamImageFile: z.instanceof(File).optional().nullable(),
});

export type ScamFormData = z.infer<typeof scamFormValidation>;
