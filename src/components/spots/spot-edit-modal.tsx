'use client';

import { useState, useRef, useEffect } from 'react';
import {
    X,
    Loader2,
    Camera,
    Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateSpot, useCategories, useCities } from '@/hooks/use-api';
import LocationPicker from '@/components/spots/location-picker';
import { Dropdown } from '@/components/ui/dropdown';
import { toast } from 'sonner';

interface SpotEditModalProps {
    spot: any;
    onClose: () => void;
}

export default function SpotEditModal({ spot, onClose }: SpotEditModalProps) {
    const updateSpotMutation = useUpdateSpot();
    const { data: categories } = useCategories();
    const { data: cities } = useCities();

    const [editName, setEditName] = useState(spot.name);
    const [editAddress, setEditAddress] = useState(spot.address);
    const [editCategory, setEditCategory] = useState(spot.categoryId || (spot.category as any)?.id);
    const [editCity, setEditCity] = useState(spot.cityId || (spot.city as any)?.id);
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editPreview, setEditPreview] = useState<string | null>(null);
    const [editLocation, setEditLocation] = useState<{
        latitude: number;
        longitude: number;
    }>({ latitude: spot.latitude, longitude: spot.longitude });

    const editFileInputRef = useRef<HTMLInputElement>(null);

    const fetchAddressFromLocation = async (latitude: number, longitude: number) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/spots/reverse-geocode`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ latitude, longitude }),
                },
            );

            if (response.ok) {
                const data = await response.json();
                if (data.address) {
                    setEditAddress(data.address);
                }
            }
        } catch (error) {
            console.error('Failed to fetch address:', error);
        }
    };

    const handleUpdateSpot = async () => {
        try {
            if (editName.length > 100) {
                toast.error('Spot name cannot exceed 100 characters');
                return;
            }

            await updateSpotMutation.mutateAsync({
                id: spot.id,
                payload: {
                    name: editName,
                    address: editAddress,
                    categoryId: editCategory,
                    cityId: editCity,
                    latitude: editLocation.latitude,
                    longitude: editLocation.longitude,
                    image: editFile || undefined,
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

    const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditFile(file);
            setEditPreview(URL.createObjectURL(file));
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

                <div className="space-y-6">
                    {/* Image Preview/Upload */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold tracking-wide text-white/50 ml-1">
                            Spot Image
                        </label>
                        <div
                            onClick={() => editFileInputRef.current?.click()}
                            className="relative h-48 rounded-2xl bg-white/5 border border-dashed border-white/20 overflow-hidden cursor-pointer group hover:border-amber-400 transition-colors"
                        >
                            {editPreview || spot.imageUrl ? (
                                <img
                                    src={editPreview || spot.imageUrl}
                                    className="w-full h-full object-cover transition-opacity group-hover:opacity-50"
                                    alt="Spot preview"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
                                    <Camera size={32} />
                                    <span className="text-[10px] font-semibold tracking-wide mt-2">
                                        Upload Image
                                    </span>
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={24} className="text-amber-400" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={editFileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleEditFileChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold tracking-wide text-white/50 ml-1">
                            Pick Location on Map
                        </label>
                        <div className="rounded-2xl overflow-hidden h-96 border border-border shadow-inner">
                            <LocationPicker
                                onLocationSelected={(loc) => {
                                    setEditLocation(loc);
                                    fetchAddressFromLocation(loc.latitude, loc.longitude);
                                }}
                                initialLocation={editLocation}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[10px] font-semibold tracking-wide text-white/50">
                                Spot Name
                            </label>
                            <span className={cn(
                                "text-[10px] font-semibold tracking-wide",
                                editName.length > 100 ? "text-red-400" : "text-white/30"
                            )}>
                                {editName.length}/100
                            </span>
                        </div>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className={cn(
                                "w-full bg-white/5 border rounded-xl px-5 py-3 text-lg font-semibold text-white focus:outline-none focus:ring-2 transition-all",
                                editName.length > 100 
                                    ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" 
                                    : "border-border focus:border-amber-400 focus:ring-amber-400/20"
                            )}
                            placeholder="Spot name"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold tracking-wide text-white/50 ml-1">
                            Address
                        </label>
                        <input
                            type="text"
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            className="w-full bg-white/5 border border-border rounded-xl px-5 py-3 text-sm font-medium text-white/70 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                            placeholder="Address"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Dropdown
                            label="Category"
                            options={categories || []}
                            value={editCategory}
                            onChange={setEditCategory}
                            placeholder="Select category..."
                        />
                        <Dropdown
                            label="City"
                            options={cities || []}
                            value={editCity}
                            onChange={setEditCity}
                            placeholder="Select city..."
                        />
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            onClick={onClose}
                            disabled={updateSpotMutation.isPending}
                            className="flex-1 py-4 px-6 rounded-2xl bg-white/10 text-white/60 font-semibold tracking-wide text-xs hover:bg-white/15 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateSpot}
                            disabled={updateSpotMutation.isPending}
                            className="flex-1 py-4 px-6 rounded-2xl bg-amber-500 text-black font-semibold tracking-wide text-xs hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {updateSpotMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
