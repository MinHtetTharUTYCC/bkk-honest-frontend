'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LocationPicker } from '@/components/ui/location-picker';
import { Dropdown } from '@/components/ui/dropdown';
import { spotSchema, SpotFormValues } from '@/lib/validations/spot';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export interface SpotFormData extends SpotFormValues {
  imageUrl?: string;
  imageFile?: File | null;
}

interface SpotFormProps {
  initialData?: Partial<SpotFormData>;
  onSubmit: (data: SpotFormData) => Promise<void>;
  isLoading: boolean;
  mode: 'create' | 'edit';
  categories: Array<{ id: string; name: string }>;
  cities: Array<{ id: string; name: string }>;
}

export default function SpotForm({
  initialData,
  onSubmit,
  isLoading,
  mode,
  categories,
  cities,
}: SpotFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imageUrl || '');
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  const form = useForm<SpotFormValues>({
    resolver: zodResolver(spotSchema),
    defaultValues: {
      name: initialData?.name || '',
      address: initialData?.address || '',
      categoryId: initialData?.categoryId || '',
      cityId: initialData?.cityId || '',
      latitude: initialData?.latitude,
      longitude: initialData?.longitude,
    },
  });

  const { setValue, watch, control, handleSubmit, formState: { errors } } = form;

  const fetchAddressFromLocation = useCallback(async (lat: number, lng: number) => {
    setIsFetchingAddress(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/spots/reverse-geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();
      if (data.address) {
        setValue('address', data.address, { shouldValidate: true });
      }
    } catch (error) {
      console.error('Failed to fetch address:', error);
    } finally {
      setIsFetchingAddress(false);
    }
  }, [setValue]);

  const handleLocationSelect = useCallback(
    (selectedLocation: { latitude: number; longitude: number }) => {
      setValue('latitude', selectedLocation.latitude, { shouldValidate: true });
      setValue('longitude', selectedLocation.longitude, { shouldValidate: true });
      fetchAddressFromLocation(selectedLocation.latitude, selectedLocation.longitude);
    },
    [setValue, fetchAddressFromLocation]
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        form.setError('image', { message: 'Image size must be less than 5MB' });
        return;
      }

      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      form.clearErrors('image');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview('');
  };

  const onFormSubmit = async (values: SpotFormValues) => {
    try {
      await onSubmit({
        ...values,
        imageFile,
        imageUrl: imagePreview,
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const currentLat = watch('latitude');
  const currentLng = watch('longitude');
  const location = currentLat && currentLng ? { latitude: currentLat, longitude: currentLng } : null;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Spot Name */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-white/70 uppercase tracking-widest">
                Spot Name <span className="text-amber-400">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jazz Bar Downtown" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location Picker */}
        <FormField
          control={control}
          name="latitude"
          render={() => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-white/70 uppercase tracking-widest">
                Location <span className="text-amber-400">*</span>
              </FormLabel>
              <FormControl>
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialLocation={location || undefined}
                  label="Location"
                  required={true}
                  isLoading={isFetchingAddress}
                  height="h-80 md:h-[600px] lg:h-screen"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-white/70 uppercase tracking-widest">
                Address <span className="text-amber-400">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder="Street address" disabled={isLoading || isFetchingAddress} {...field} />
                  {isFetchingAddress && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 size={16} className="text-amber-400 animate-spin" />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription className="text-xs text-white/50">
                {mode === 'edit' ? 'Edit the address as needed' : 'Auto-populated from map location'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Selector */}
        <FormField
          control={control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-white/70 uppercase tracking-widest">
                Category <span className="text-amber-400">*</span>
              </FormLabel>
              <FormControl>
                <Dropdown
                  options={categories}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select category"
                  name="category"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* City Selector */}
        <FormField
          control={control}
          name="cityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-white/70 uppercase tracking-widest">
                City <span className="text-amber-400">*</span>
              </FormLabel>
              <FormControl>
                <Dropdown
                  options={cities}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select city"
                  name="city"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest">
            Image <span className="text-white/50">(Optional)</span>
          </label>

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={isLoading}
                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="block cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                className="hidden"
                aria-label="Upload image"
              />
              <div className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                "hover:bg-white/5 hover:border-amber-400/50",
                isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              )}>
                <Upload size={24} className="text-white/50 group-hover:text-amber-400 mx-auto mb-2 transition-colors" />
                <p className="text-sm text-white/70">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-white/50 mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </label>
          )}
          {errors.image && <p className="text-xs text-red-400">{String(errors.image.message)}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isFetchingAddress}
          className={cn(
            "w-full bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl text-sm font-semibold tracking-wide",
            "transition-all flex items-center justify-center gap-2",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {mode === 'create' ? 'Creating Spot...' : 'Updating Spot...'}
            </>
          ) : (
            mode === 'create' ? 'Create Spot' : 'Update Spot'
          )}
        </button>
      </form>
    </Form>
  );
}
