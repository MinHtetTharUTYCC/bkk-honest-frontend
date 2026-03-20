'use client';

import { X } from 'lucide-react';
import { useUpdateSpot, useCategories, useCities } from '@/hooks/use-api';
import SpotForm, { SpotFormData } from '@/components/spots/spot-form';
import { toast } from 'sonner';

interface SpotEditModalProps {
    spot: any;
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
                    image: formData.imageFile || undefined,
                },
            });
            toast.success('Spot updated successfully');
            onClose();
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update spot';
            toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to update spot');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-border relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"
                >
                    <X size={20} className="text-white/50" />
                </button>

                <h3 className="text-2xl font-semibold text-white uppercase italic tracking-tighter mb-8">
                    Edit Spot
                </h3>

                <SpotForm
                    mode="edit"
                    initialData={{
                        name: spot.name,
                        address: spot.address,
                        categoryId: spot.categoryId || (spot.category as any)?.id,
                        cityId: spot.cityId || (spot.city as any)?.id,
                        latitude: spot.latitude,
                        longitude: spot.longitude,
                        imageUrl: spot.imageUrl,
                    }}
                    categories={categories}
                    cities={cities}
                    isLoading={updateSpotMutation.isPending}
                    onSubmit={handleUpdateSpot}
                />
            </div>
        </div>
    );
}
