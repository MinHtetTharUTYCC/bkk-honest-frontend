'use client';

import { useState } from 'react';
import {
    useSpots,
    useCategories,
    useCreatePriceReport,
    useCreateScamAlert,
    useCreateSpot,
    useCities,
    useUploadSpotImage,
} from '@/hooks/use-api';
import SearchableSpotSelect from '@/components/spots/searchable-spot-select';
import CreateVibeForm from '@/components/vibes/create-vibe-form';
import LocationPicker from '@/components/spots/location-picker';
import { Dropdown } from '@/components/ui/dropdown';
import { Zap, AlertCircle, DollarSign, Send, CheckCircle2, MapPin, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { useCity } from '@/components/providers/city-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { useEffect } from 'react';
import LoginRequired from '@/components/auth/login-required';

export default function ReportPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { selectedCityId, selectedCity } = useCity();
    const [activeTab, setActiveTab] = useState<'price' | 'scam' | 'vibe' | 'spot'>('price');
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const [submitted, setSubmitted] = useState(false);

    // Price State
    const [priceSpotId, setPriceSpotId] = useState('');
    const [itemName, setItemName] = useState('');

    // Scam State
    const [scamName, setScamName] = useState('');
    const [scamDescription, setScamDescription] = useState('');
    const [scamPreventionTip, setScamPreventionTip] = useState('');
    const [scamCategory, setScamCategory] = useState('');
    const [scamCity, setScamCity] = useState(selectedCityId || '');

    // Spot State
    const [spotName, setSpotName] = useState('');
    const [spotAddress, setSpotAddress] = useState('');
    const [spotCity, setSpotCity] = useState(selectedCityId || '');
    const [spotCategory, setSpotCategory] = useState('');
    const [spotLocation, setSpotLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [spotImageFile, setSpotImageFile] = useState<File | null>(null);
    const [spotImagePreview, setSpotImagePreview] = useState<string>('');
    const [scamImageFile, setScamImageFile] = useState<File | null>(null);
    const [scamImagePreview, setScamImagePreview] = useState<string>('');

    // Sync cities when selectedCityId changes
    useEffect(() => {
        if (selectedCityId) {
            setSpotCity(selectedCityId);
            setScamCity(selectedCityId);
        }
    }, [selectedCityId]);

    // Data for Selects
    const { data: spotsResponse } = useSpots({ cityId: selectedCityId });
    const { data: categoriesResponse } = useCategories();
    const { data: citiesResponse } = useCities();

    // @ts-ignore
    const spots = spotsResponse?.data || spotsResponse || [];
    // @ts-ignore
    const categories = categoriesResponse?.data || categoriesResponse || [];
    // @ts-ignore
    const cities = citiesResponse?.data || citiesResponse || [];

    // Mutations
    const createPrice = useCreatePriceReport();
    const createScam = useCreateScamAlert();
    const createSpot = useCreateSpot();
    const uploadImage = useUploadSpotImage();

    const handlePriceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (!priceSpotId) return setError('Please select a spot');

        if (itemName.length > 100) {
            setError('Item name cannot exceed 100 characters');
            return;
        }

        try {
            const formData = new FormData(e.currentTarget);
            await createPrice.mutateAsync({
                spotId: priceSpotId,
                itemName: itemName,
                priceThb: Number(formData.get('priceThb')),
            });
            setSubmitted(true);
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to publish price report';
            setError(Array.isArray(message) ? message.join(', ') : message);
        }
    };

    const handleScamSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (!scamCity) return setError('Please select a city');

        if (scamName.length > 100) {
            setError('Scam name cannot exceed 100 characters');
            return;
        }

        if (scamDescription.length > 500) {
            setError('Description cannot exceed 500 characters');
            return;
        }

        if (scamPreventionTip.length > 300) {
            setError('Prevention tip cannot exceed 300 characters');
            return;
        }

        try {
            await createScam.mutateAsync({
                scamName,
                description: scamDescription,
                preventionTip: scamPreventionTip,
                cityId: scamCity,
                categoryId: scamCategory,
                image: scamImageFile || undefined,
            });
            setSubmitted(true);
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to publish scam alert';
            setError(Array.isArray(message) ? message.join(', ') : message);
        }
    };

    const handleScamImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB');
                return;
            }
            setScamImageFile(file);
            const preview = URL.createObjectURL(file);
            setScamImagePreview(preview);
        }
    };

    const handleRemoveScamImage = () => {
        setScamImageFile(null);
        if (scamImagePreview && scamImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(scamImagePreview);
        }
        setScamImagePreview('');
    };

    const fetchAddressFromLocation = async (latitude: number, longitude: number) => {
        try {
            // Try to use backend reverse geocoding endpoint
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) {
                console.error('API URL not configured');
                setSpotAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                return;
            }

            const response = await fetch(`${apiUrl}/spots/reverse-geocode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude, longitude }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.address) {
                    setSpotAddress(data.address);
                }
            }
        } catch (error) {
            console.error('Failed to fetch address:', error);
            // Fallback: just show coordinates
            setSpotAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
    };

    const handleSpotImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB');
                return;
            }
            setSpotImageFile(file);
            const preview = URL.createObjectURL(file);
            setSpotImagePreview(preview);
        }
    };

    const handleRemoveSpotImage = () => {
        setSpotImageFile(null);
        if (spotImagePreview && spotImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(spotImagePreview);
        }
        setSpotImagePreview('');
    };

    const handleSpotSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (!spotLocation) {
            setError('Please select a location on the map');
            return;
        }

        if (spotAddress.length > 200) {
            setError('Address cannot exceed 200 characters');
            return;
        }

        if (spotName.length > 100) {
            setError('Spot name cannot exceed 100 characters');
            return;
        }

        try {
            // Create spot with image in one request
            await createSpot.mutateAsync({
                name: spotName,
                address: spotAddress,
                categoryId: spotCategory,
                cityId: spotCity,
                latitude: spotLocation.latitude,
                longitude: spotLocation.longitude,
                image: spotImageFile || undefined,
            });

            setSubmitted(true);
        } catch (err: any) {
            console.error('Failed to create spot:', err);
            const message = err?.response?.data?.message || 'Failed to create spot';
            setError(Array.isArray(message) ? message.join(', ') : message);
        }
    };

    if (!isClient || authLoading) {
        return (
            <div className="space-y-12 animate-pulse">
                <div className="h-12 w-48 bg-white/5 rounded-xl" />
                <div className="h-16 bg-white/5 rounded-3xl" />
                <div className="h-96 bg-white/5 rounded-2xl" />
            </div>
        );
    }

    if (!user) {
        return <LoginRequired />;
    }

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-400/10 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-400/20 animate-bounce">
                    <CheckCircle2 size={40} />
                </div>
                <div className="space-y-2">
                    <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
                        Published!
                    </h2>
                    <p className="text-white/40 font-medium uppercase tracking-widest text-[10px]">
                        Your contribution has been added to the pulse.
                    </p>
                </div>
                <button
                    onClick={() => router.push('/')}
                    className="bg-amber-400 text-black px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-amber-300 transition-colors"
                >
                    Back to Pulse
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-12 pb-24">
            <header className="flex flex-col gap-1">
                <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">
                    Contribute
                </h1>
                <p className="text-white/40 font-medium uppercase tracking-widest text-[10px]">
                    Keep {selectedCity?.name || 'the city'} honest by sharing live reports
                </p>
            </header>

            {/* Tabs */}
            <div className="bg-white/8 p-1.5 rounded-3xl flex flex-wrap md:flex-nowrap gap-1">
                {(['price', 'scam', 'vibe', 'spot'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => {
                            setActiveTab(tab);
                            setError(null);
                        }}
                        className={cn(
                            'flex-1 min-w-25 py-3.5 rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all',
                            activeTab === tab
                                ? 'bg-amber-400 text-black shadow-sm'
                                : 'text-white/40 hover:text-white/70',
                        )}
                    >
                        {tab === 'price' && (
                            <div className="flex items-center justify-center gap-2">
                                <DollarSign size={14} /> Price
                            </div>
                        )}
                        {tab === 'scam' && (
                            <div className="flex items-center justify-center gap-2">
                                <AlertCircle size={14} /> Scam
                            </div>
                        )}
                        {tab === 'vibe' && (
                            <div className="flex items-center justify-center gap-2">
                                <Zap size={14} /> Vibe
                            </div>
                        )}
                        {tab === 'spot' && (
                            <div className="flex items-center justify-center gap-2">
                                <MapPin size={14} /> Spot
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <div className="bg-card rounded-2xl p-8 md:p-10 border border-white/8 shadow-2xl shadow-black/30">
                {activeTab === 'price' && (
                    <form onSubmit={handlePriceSubmit} className="space-y-8">
                        <SearchableSpotSelect
                            name="spotId"
                            required
                            placeholder="Search spots..."
                            cityId={selectedCityId}
                            onSelect={(id) => setPriceSpotId(id)}
                        />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                        Item Name
                                    </label>
                                    <input
                                        name="itemName"
                                        required
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value)}
                                        placeholder="e.g. Pad Thai"
                                        className={cn(
                                            "w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none",
                                            (itemName?.length || 0) > 100 && "border-red-500/50 ring-1 ring-red-500/20"
                                        )}
                                    />
                                    <div className="flex justify-end">
                                        <span className={cn(
                                            "text-[9px] font-bold tracking-normal transition-colors",
                                            (itemName?.length || 0) > 100 ? "text-red-400" : "text-white/30"
                                        )}>
                                            {itemName?.length || 0}/100
                                        </span>
                                    </div>
                                </div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                    Price (THB)
                                </label>
                                <input
                                    name="priceThb"
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="0.00"
                                    className="w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none"
                                />
                            </div>
                        </div>

                        <button
                            disabled={createPrice.isPending || !priceSpotId || itemName.length > 100}
                            className="w-full bg-amber-400 text-black py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-amber-300 transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-400/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            <Send size={16} />
                            {createPrice.isPending ? 'Publishing...' : 'Publish Price Report'}
                        </button>
                    </form>
                )}

                {activeTab === 'scam' && (
                    <form onSubmit={handleScamSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                Scam Name
                            </label>
                            <input
                                value={scamName}
                                onChange={(e) => setScamName(e.target.value)}
                                required
                                placeholder="e.g. Broken Meter Taxi"
                                className={cn(
                                    "w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none",
                                    scamName.length > 100 && "border-red-500/50 ring-1 ring-red-500/20"
                                )}
                            />
                            <div className="flex justify-end">
                                <span className={cn(
                                    "text-[9px] font-bold tracking-normal transition-colors",
                                    scamName.length > 100 ? "text-red-400" : "text-white/30"
                                )}>
                                    {scamName.length}/100
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Dropdown
                                label="City"
                                options={cities || []}
                                value={scamCity}
                                onChange={setScamCity}
                                placeholder="Select city..."
                            />
                            <Dropdown
                                label="Category"
                                options={categories || []}
                                value={scamCategory}
                                onChange={setScamCategory}
                                placeholder="Select category..."
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                Description
                            </label>
                            <textarea
                                value={scamDescription}
                                onChange={(e) => setScamDescription(e.target.value)}
                                required
                                rows={4}
                                placeholder="What happened? Be specific."
                                className={cn(
                                    "w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none resize-none",
                                    scamDescription.length > 500 && "border-red-500/50 ring-1 ring-red-500/20"
                                )}
                            />
                            <div className="flex justify-end">
                                <span className={cn(
                                    "text-[9px] font-bold tracking-normal transition-colors",
                                    scamDescription.length > 500 ? "text-red-400" : "text-white/30"
                                )}>
                                    {scamDescription.length}/500
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                Prevention Tip
                            </label>
                            <textarea
                                value={scamPreventionTip}
                                onChange={(e) => setScamPreventionTip(e.target.value)}
                                required
                                rows={3}
                                placeholder="How can others avoid this?"
                                className={cn(
                                    "w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none resize-none",
                                    scamPreventionTip.length > 300 && "border-red-500/50 ring-1 ring-red-500/20"
                                )}
                            />
                            <div className="flex justify-end">
                                <span className={cn(
                                    "text-[9px] font-bold tracking-normal transition-colors",
                                    scamPreventionTip.length > 300 ? "text-red-400" : "text-white/30"
                                )}>
                                    {scamPreventionTip.length}/300
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                Image <span className="text-white/50">(Optional)</span>
                            </label>

                            {scamImagePreview ? (
                                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
                                    <img
                                        src={scamImagePreview}
                                        alt="Scam preview"
                                        className="w-full h-64 object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveScamImage}
                                        disabled={createScam.isPending}
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
                                        onChange={handleScamImageChange}
                                        disabled={createScam.isPending}
                                        className="hidden"
                                        aria-label="Upload scam image"
                                    />
                                    <div
                                        className={cn(
                                            'border-2 border-dashed rounded-xl p-8 text-center transition-all',
                                            'hover:bg-white/5 hover:border-red-400/50',
                                            createScam.isPending
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'cursor-pointer',
                                        )}
                                    >
                                        <Upload
                                            size={24}
                                            className="text-white/50 group-hover:text-red-400 mx-auto mb-2 transition-colors"
                                        />
                                        <p className="text-sm text-white/70">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-white/50 mt-1">
                                            PNG, JPG, GIF up to 5MB
                                        </p>
                                    </div>
                                </label>
                            )}
                        </div>

                        <button
                            disabled={
                                createScam.isPending ||
                                !scamName ||
                                !scamDescription ||
                                !scamCategory ||
                                !scamCity ||
                                scamName.length > 100 ||
                                scamDescription.length > 500 ||
                                scamPreventionTip.length > 300
                            }
                            className="w-full bg-red-500 text-white py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-400/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            <AlertCircle size={16} />
                            {createScam.isPending ? 'Publishing...' : 'Publish Scam Alert'}
                        </button>
                    </form>
                )}

                {activeTab === 'vibe' && (
                    <CreateVibeForm
                        showSpotSelect
                        cityId={selectedCityId}
                        onSuccess={() => setSubmitted(true)}
                    />
                )}

                {activeTab === 'spot' && (
                    <form onSubmit={handleSpotSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                Spot Name
                            </label>
                            <input
                                value={spotName}
                                onChange={(e) => setSpotName(e.target.value)}
                                required
                                placeholder="e.g. Jek Pui Curry"
                                className={cn(
                                    "w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none",
                                    spotName.length > 100 && "border-red-500/50 ring-1 ring-red-500/20"
                                )}
                            />
                            <div className="flex justify-end">
                                <span className={cn(
                                    "text-[9px] font-bold tracking-normal transition-colors",
                                    spotName.length > 100 ? "text-red-400" : "text-white/30"
                                )}>
                                    {spotName.length}/100
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                Pick Location on Map
                            </label>
                            <div className="rounded-2xl overflow-hidden h-125 border border-white/10">
                                <LocationPicker
                                    onLocationSelected={(loc) => {
                                        setSpotLocation(loc);
                                        // Auto-fetch address from location
                                        fetchAddressFromLocation(loc.latitude, loc.longitude);
                                    }}
                                    initialLocation={spotLocation || undefined}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                Address
                                <span className="text-white/60 text-[12px] ml-2">
                                    (Auto-populated, editable)
                                </span>
                            </label>
                            <textarea
                                value={spotAddress}
                                onChange={(e) => setSpotAddress(e.target.value)}
                                required
                                placeholder="e.g. 25 Mangkon Rd, Bangkok"
                                rows={3}
                                className={cn(
                                    "w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none resize-none",
                                    spotAddress.length > 200 && "border-red-500/50 ring-1 ring-red-500/20"
                                )}
                            />
                            <div className="flex justify-end">
                                <span className={cn(
                                    "text-[9px] font-bold tracking-normal transition-colors",
                                    spotAddress.length > 200 ? "text-red-400" : "text-white/30"
                                )}>
                                    {spotAddress.length}/200
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Dropdown
                                label="City"
                                options={cities || []}
                                value={spotCity}
                                onChange={setSpotCity}
                                placeholder="Select city..."
                            />
                            <Dropdown
                                label="Category"
                                options={categories || []}
                                value={spotCategory}
                                onChange={setSpotCategory}
                                placeholder="Select category..."
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                Image <span className="text-white/50">(Optional)</span>
                            </label>

                            {spotImagePreview ? (
                                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
                                    <img
                                        src={spotImagePreview}
                                        alt="Spot preview"
                                        className="w-full h-64 object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveSpotImage}
                                        disabled={createSpot.isPending}
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
                                        onChange={handleSpotImageChange}
                                        disabled={createSpot.isPending}
                                        className="hidden"
                                        aria-label="Upload spot image"
                                    />
                                    <div
                                        className={cn(
                                            'border-2 border-dashed rounded-xl p-8 text-center transition-all',
                                            'hover:bg-white/5 hover:border-amber-400/50',
                                            createSpot.isPending
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'cursor-pointer',
                                        )}
                                    >
                                        <Upload
                                            size={24}
                                            className="text-white/50 group-hover:text-amber-400 mx-auto mb-2 transition-colors"
                                        />
                                        <p className="text-sm text-white/70">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-white/50 mt-1">
                                            PNG, JPG, GIF up to 5MB
                                        </p>
                                    </div>
                                </label>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={
                                createSpot.isPending ||
                                !spotLocation ||
                                !spotName ||
                                !spotAddress ||
                                !spotCategory ||
                                !spotCity ||
                                spotAddress.length > 200 ||
                                spotName.length > 100
                            }
                            className="w-full bg-amber-400 text-black py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-amber-300 transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-400/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            <MapPin size={16} />
                            {createSpot.isPending ? 'Creating...' : 'Create New Spot'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
