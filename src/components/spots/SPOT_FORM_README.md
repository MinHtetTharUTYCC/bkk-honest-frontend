# SpotForm Component

A comprehensive, reusable form component for creating and editing spots in the BKK Honest frontend.

## Features

- **Dual Mode Support**: Seamlessly handles both creation and editing modes
- **Interactive Map Location Picker**: Click on map to select location or use geolocation
- **Automatic Address Fetching**: Uses Mapbox reverse geocoding API to auto-populate address from location
- **Image Upload with Preview**: Support for optional image uploads with instant preview
- **Category & City Selection**: Custom dropdowns for selecting spot metadata
- **Real-time Validation**: Field-level validation with error messages
- **Dark Theme Styling**: Follows the existing BKK Honest design system with amber accents
- **Accessible**: Fully keyboard navigable and ARIA compliant

## Component Structure

### SpotForm Component (`/src/components/spots/spot-form.tsx`)

Main form component that orchestrates all input fields and validation.

#### Props

```typescript
interface SpotFormProps {
  // Data to populate form fields (for edit mode)
  initialData?: {
    name: string;
    address: string;
    categoryId: string;
    cityId: string;
    latitude?: number;
    longitude?: number;
    imageUrl?: string;
  };
  
  // Callback when form is submitted
  onSubmit: (data: SpotFormData) => Promise<void>;
  
  // Whether API call is in progress
  isLoading: boolean;
  
  // Form mode: 'create' for new spot, 'edit' for existing spot
  mode: 'create' | 'edit';
  
  // Array of available categories
  categories: Array<{ id: string; name: string }>;
  
  // Array of available cities
  cities: Array<{ id: string; name: string }>;
}
```

#### Return Data

```typescript
interface SpotFormData {
  name: string;
  address: string;
  categoryId: string;
  cityId: string;
  latitude: number;
  longitude: number;
  imageUrl?: string; // File or URL, handled by parent
}
```

### LocationPicker Component (`/src/components/ui/location-picker.tsx`)

Interactive map component for selecting spot location.

#### Props

```typescript
interface LocationPickerProps {
  // Callback with selected coordinates
  onLocationSelect: (location: { latitude: number; longitude: number }) => void;
  
  // Pre-selected location coordinates
  initialLocation?: { latitude: number; longitude: number };
  
  // Label shown above map
  label?: string;
  
  // Whether location is required (shows asterisk)
  required?: boolean;
  
  // Show loading state
  isLoading?: boolean;
  
  // Map container height (Tailwind class, default: 'h-80')
  height?: string;
}
```

## Usage Examples

### Create Mode

```typescript
'use client';

import { useState } from 'react';
import SpotForm, { SpotFormData } from '@/components/spots/spot-form';
import { useCreateSpot, useCategories, useCities } from '@/hooks/use-api';

export default function CreateSpotPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: categories = [] } = useCategories();
  const { data: cities = [] } = useCities();
  const createSpotMutation = useCreateSpot();

  const handleSubmit = async (data: SpotFormData) => {
    setIsLoading(true);
    try {
      await createSpotMutation.mutateAsync({
        name: data.name,
        address: data.address,
        categoryId: data.categoryId,
        cityId: data.cityId,
        latitude: data.latitude,
        longitude: data.longitude,
      });
      // Handle success (redirect, show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Create a New Spot</h1>
      <SpotForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        mode="create"
        categories={categories}
        cities={cities}
      />
    </div>
  );
}
```

### Edit Mode

```typescript
'use client';

import { useState } from 'react';
import SpotForm, { SpotFormData } from '@/components/spots/spot-form';
import { 
  useSpot,
  useUpdateSpot,
  useCategories,
  useCities,
} from '@/hooks/use-api';

export default function EditSpotPage({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: spot } = useSpot(id);
  const { data: categories = [] } = useCategories();
  const { data: cities = [] } = useCities();
  const updateSpotMutation = useUpdateSpot();

  const handleSubmit = async (data: SpotFormData) => {
    setIsLoading(true);
    try {
      // Handle image upload separately if needed
      const imageFile = data.imageUrl?.startsWith('blob:') 
        ? data.imageUrl 
        : undefined;

      await updateSpotMutation.mutateAsync({
        id,
        payload: {
          name: data.name,
          address: data.address,
          categoryId: data.categoryId,
          cityId: data.cityId,
          latitude: data.latitude,
          longitude: data.longitude,
          // Image file handling depends on your API
        },
      });
      // Handle success
    } finally {
      setIsLoading(false);
    }
  };

  if (!spot) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Edit Spot</h1>
      <SpotForm
        initialData={{
          name: spot.name,
          address: spot.address,
          categoryId: spot.categoryId || spot.category?.id,
          cityId: spot.cityId || spot.city?.id,
          latitude: spot.latitude,
          longitude: spot.longitude,
          imageUrl: spot.imageUrl,
        }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        mode="edit"
        categories={categories}
        cities={cities}
      />
    </div>
  );
}
```

## Behavior Details

### Location Selection

**Create Mode:**
- Location picker is required
- Form validation prevents submission without location
- Once location is selected, address is auto-fetched from Mapbox

**Edit Mode:**
- Location can be changed
- Address can be edited manually
- Address updates auto-fetch when location changes

### Address Auto-Fetching

1. User selects location on map
2. Component triggers Mapbox reverse geocoding API
3. Loading state displayed in address input
4. Address auto-populates with formatted address
5. User can still manually edit if needed

### Image Handling

- Optional field
- Accepts common image formats
- Max file size: 5MB
- Shows instant preview with remove button
- Preview revokes blob URL when removed

### Form Validation

- **Spot Name**: Required, non-empty string
- **Location**: Required (especially in create mode)
- **Address**: Required, non-empty string
- **Category**: Required selection
- **City**: Required selection
- **Image**: Optional, validated by file size

Errors display below each field in red text.

## Styling

Components follow the existing BKK Honest design system:

- **Dark Theme**: `bg-white/5` backgrounds with `border-white/10`
- **Accents**: Amber (`amber-400`, `amber-500`) for interactive elements
- **Typography**: Uppercase labels with tracking
- **Spacing**: Tailwind spacing utilities
- **Icons**: Lucide React icons
- **Animations**: Framer Motion for transitions

## Integration Notes

1. **Dependencies**: Requires `react-map-gl`, `mapbox-gl`, `lucide-react`, `framer-motion`
2. **Environment**: Requires `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local`
3. **TypeScript**: Fully typed with strict mode compatible
4. **Accessibility**: WCAG 2.1 AA compliant with proper ARIA labels

## Performance Considerations

- Location picker uses Mapbox GL JS (GPU-accelerated rendering)
- Address fetching debounced (user can still edit immediately)
- Image preview uses client-side blob URLs
- Validation is client-side only (instant feedback)

## Error Handling

The component handles:
- Missing Mapbox token (error message displayed)
- Failed address geocoding (silently fails, allows manual entry)
- File upload errors (size validation, format checking)
- Network errors during image operations (user notified)
- Form submission errors (propagated to parent component)
