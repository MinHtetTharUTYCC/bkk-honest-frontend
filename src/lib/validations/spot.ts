import { z } from "zod";

export const spotSchema = z.object({
  name: z.string()
    .min(3, "Spot name must be at least 3 characters")
    .max(100, "Spot name cannot exceed 100 characters"),
  address: z.string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address cannot exceed 200 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  cityId: z.string().min(1, "Please select a city"),
  latitude: z.number({
    required_error: "Please select a location on the map",
  }),
  longitude: z.number({
    required_error: "Please select a location on the map",
  }),
  image: z.any().optional(),
});

export type SpotFormValues = z.infer<typeof spotSchema>;
