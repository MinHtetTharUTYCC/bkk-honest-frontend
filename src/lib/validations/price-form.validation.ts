import { z } from 'zod';

export const priceFormValidation = z.object({
    spotId: z.string().min(1, 'Please select a spot'),
    itemName: z
        .string()
        .min(1, 'Item name is required')
        .max(100, 'Item name cannot exceed 100 characters'),
    priceThb: z
        .number()
        .positive('Price must be greater than 0'),
});

export type PriceFormData = z.infer<typeof priceFormValidation>;
