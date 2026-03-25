'use client';

import { X } from 'lucide-react';
import { useUpdateSpot, useCategories, useCities } from '@/hooks/use-api';
import SpotForm, { SpotFormData } from '@/components/spots/spot-form';
import { toast } from 'sonner';


interface SpotEditModalProps {
    spot: unknown;
    onClose: () => void;
}

export default function SpotEditModal({ spot, onClose }: SpotEditModalProps) {
    const updateSpotMutation = useUpdateSpot();
    const { data: categoriesResponse } = useCategories();
    const { data: citiesResponse } = useCities();

    const categories = categoriesResponse?.data || categoriesResponse || [];
    const cities = citiesResponse?.data || citiesResponse || [];

    const handleUpdateSpot = async (formData: SpotFormData) => {
        try {
            await updateSpotMutation.mutateAsync({
                id: spot.id,
                payload: {
                    name: formData.name,
                    address: formData.address,
                    categoryId: formData.categoryId,
                    cityId: formData.cityId,
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    image: formData.imageFile || undefined } });
            toast.success(' updated successfully');
            onClose();
        } catch (err: unknown) {
            console.error(err);
            const message = err.response?.data?.message || err.message || 'Failed to update spot';
            const errorMessage = Array.isArray(message) ? message.join(', ') : message;
            toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to update spot');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-white/8 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 scrollbar-hide">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors z-10"
                >
                    <X size={20} className="text-white/50" />
                </button>

                <div className="flex flex-col gap-1 mb-8">
                    <h3 className="font-display text-3xl font-bold text-foreground tracking-tight">
                        Edit 
                    </h3>
                    <p className="text-white/40 font-medium uppercase tracking-widest text-[10px]">
                        Keep the pulse updated for {spot.name}
                    </p>
                </div>

                <SpotForm
                    mode="edit"
                    initialData={{
                        name: spot.name,
                        address: spot.address,
                        categoryId: spot.categoryId || (spot.category as unknown)?.id,
                        cityId: spot.cityId || (spot.city as unknown)?.id,
                        latitude: spot.latitude,
                        longitude: spot.longitude,
                        imageUrl: spot.imageUrl }}
                    categories={categories}
                    cities={cities}
                    isLoading={updateSpotMutation.isPending}
                    onSubmit={handleUpdateSpot}
                />
            </div>
        </div>
    );
}
