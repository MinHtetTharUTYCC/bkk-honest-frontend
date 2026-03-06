'use client';

import { useState, useCallback } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LocationPicker } from '@/components/ui/location-picker';
import { Dropdown } from '@/components/ui/dropdown';

export interface SpotFormData {
  name: string;
  address: string;
  categoryId: string;
  cityId: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

interface SpotFormProps {
  initialData?: {
    name: string;
    address: string;
    categoryId: string;
    cityId: string;
    latitude?: number;
    longitude?: number;
    imageUrl?: string;
  };
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
  const [name, setName] = useState(initialData?.name || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [cityId, setCityId] = useState(initialData?.cityId || '');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(
    initialData?.latitude && initialData?.longitude
      ? { latitude: initialData.latitude, longitude: initialData.longitude }
      : null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imageUrl || '');
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Spot name is required';
    }

    if (!categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!cityId) {
      newErrors.cityId = 'City is required';
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!location) {
      newErrors.location = mode === 'create' ? 'Please select a location on the map' : 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, categoryId, cityId, address, location, mode]);

  const fetchAddressFromLocation = useCallback(async (lat: number, lng: number) => {
    setIsFetchingAddress(true);
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) {
        console.error('Mapbox token not configured');
        return;
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const placeName = data.features[0].place_name;
        if (placeName) {
          setAddress(placeName);
        }
      }
    } catch (error) {
      console.error('Failed to fetch address:', error);
    } finally {
      setIsFetchingAddress(false);
    }
  }, []);

  const handleLocationSelect = useCallback(
    (selectedLocation: { latitude: number; longitude: number; address?: string }) => {
      setLocation(selectedLocation);
      if (selectedLocation.address) {
        setAddress(selectedLocation.address);
      } else {
        // If no address from LocationPicker, fetch it
        fetchAddressFromLocation(selectedLocation.latitude, selectedLocation.longitude);
      }
    },
    [fetchAddressFromLocation]
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }

      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      setErrors(prev => {
        const { image, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!location) {
      setErrors({ location: 'Location is required' });
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        address: address.trim(),
        categoryId,
        cityId,
        latitude: location.latitude,
        longitude: location.longitude,
        imageUrl: imageFile ? 'image-file' : imagePreview || undefined,
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Spot Name */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest">
          Spot Name <span className="text-amber-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors(prev => {
              const { name, ...rest } = prev;
              return rest;
            });
          }}
          placeholder="e.g., Jazz Bar Downtown"
          disabled={isLoading}
          className={cn(
            "w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20",
            "focus:outline-none transition-all",
            errors.name
              ? "border-red-500/50 focus:border-red-500"
              : "border-white/10 focus:border-amber-400/50"
          )}
        />
        {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
      </div>

      {/* Location Picker */}
      <div className="space-y-2">
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          initialLocation={location || undefined}
          label="Location"
          required={true}
          isLoading={isFetchingAddress}
          height="h-80 md:h-[600px] lg:h-screen"
        />
        {errors.location && <p className="text-xs text-red-400">{errors.location}</p>}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest">
          Address <span className="text-amber-400">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (errors.address) setErrors(prev => {
                const { address, ...rest } = prev;
                return rest;
              });
            }}
            placeholder="Street address"
            disabled={isLoading || isFetchingAddress}
            className={cn(
              "w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20",
              "focus:outline-none transition-all",
              errors.address
                ? "border-red-500/50 focus:border-red-500"
                : "border-white/10 focus:border-amber-400/50"
            )}
          />
          {isFetchingAddress && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 size={16} className="text-amber-400 animate-spin" />
            </div>
          )}
        </div>
        <p className="text-xs text-white/50">
          {mode === 'edit' ? 'Edit the address as needed' : 'Auto-populated from map location'}
        </p>
        {errors.address && <p className="text-xs text-red-400">{errors.address}</p>}
      </div>

      {/* Category Selector */}
      <div className="space-y-2">
        <Dropdown
          options={categories}
          value={categoryId}
          onChange={(id) => {
            setCategoryId(id);
            if (errors.categoryId) setErrors(prev => {
              const { categoryId, ...rest } = prev;
              return rest;
            });
          }}
          placeholder="Select category"
          label="Category"
          name="category"
          disabled={isLoading}
        />
        {errors.categoryId && <p className="text-xs text-red-400">{errors.categoryId}</p>}
      </div>

      {/* City Selector */}
      <div className="space-y-2">
        <Dropdown
          options={cities}
          value={cityId}
          onChange={(id) => {
            setCityId(id);
            if (errors.cityId) setErrors(prev => {
              const { cityId, ...rest } = prev;
              return rest;
            });
          }}
          placeholder="Select city"
          label="City"
          name="city"
          disabled={isLoading}
        />
        {errors.cityId && <p className="text-xs text-red-400">{errors.cityId}</p>}
      </div>

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
        {errors.image && <p className="text-xs text-red-400">{errors.image}</p>}
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
  );
}
