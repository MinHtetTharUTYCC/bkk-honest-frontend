'use client';

import { useState } from 'react';
import {
    useCategories,
    useCreatePriceReport,
    useCreateScamAlert,
    useCreateSpot,
    useCities,
} from '@/hooks/use-api';
import CreateVibeForm from '@/components/vibes/create-vibe-form';
import SpotForm, { SpotFormData } from '@/components/spots/spot-form';
import PriceForm from '@/components/report/price-form';
import ScamForm from '@/components/report/scam-form';
import TabSwitcher from '@/components/report/tab-switcher';
import SuccessMessage from '@/components/report/success-message';
import ErrorAlert from '@/components/report/error-alert';
import LoadingSkeleton from '@/components/report/loading-skeleton';
import { useCity } from '@/components/providers/city-provider';
import { useAuth } from '@/components/providers/auth-provider';
import LoginRequired from '@/components/auth/login-required';
import { PriceFormData } from '@/lib/validations/price-form.validation';
import { ScamFormData } from '@/lib/validations/scam-form.validation';

export default function ReportPage() {
    const { user, loading: authLoading } = useAuth();
    const { selectedCityId, selectedCity } = useCity();
    const [activeTab, setActiveTab] = useState<'price' | 'scam' | 'vibe' | 'spot'>('spot');
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    // API mutations
    const createPrice = useCreatePriceReport();
    const createScam = useCreateScamAlert();
    const createSpot = useCreateSpot();

    // API queries
    const { data: categoriesResponse } = useCategories();
    const { data: citiesResponse } = useCities();

    const categories = categoriesResponse || [];
    const cities = citiesResponse || [];

    // Handlers
    const handlePriceSubmit = async (data: PriceFormData) => {
        await createPrice.mutateAsync({
            spotId: data.spotId,
            itemName: data.itemName,
            priceThb: data.priceThb,
        });
    };

    const handleScamSubmit = async (data: ScamFormData) => {
        await createScam.mutateAsync({
            scamName: data.scamName,
            description: data.scamDescription,
            preventionTip: data.scamPreventionTip,
            cityId: data.scamCity,
            categoryId: data.scamCategory,
            image: data.scamImageFile || undefined,
        });
    };

    const handleSpotSubmit = async (formData: SpotFormData): Promise<void> => {
        await createSpot.mutateAsync({
            name: formData.name,
            address: formData.address || '',
            categoryId: formData.categoryId,
            cityId: formData.cityId,
            latitude: formData.latitude,
            longitude: formData.longitude,
            image: formData.imageFile || undefined,
        } as any);
    };

    // Loading state
    if (!user || authLoading) {
        if (authLoading) return <LoadingSkeleton />;
        return <LoginRequired />;
    }

    // Success state
    if (submitted) {
        return <SuccessMessage onSubmitAnother={() => setSubmitted(false)} />;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-12 pb-24">
            {/* Header */}
            <header className="flex flex-col gap-1">
                <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">
                    Contribute
                </h1>
                <p className="text-white/40 font-medium uppercase tracking-widest text-[10px]">
                    Keep {selectedCity?.name || 'the city'} honest by sharing live reports
                </p>
            </header>

            {/* Tab Switcher */}
            <TabSwitcher
                activeTab={activeTab}
                onTabChange={(tab) => {
                    setActiveTab(tab);
                    setError(null);
                }}
            />

            {/* Error Alert */}
            {error && <ErrorAlert message={error} />}

            {/* Form Container */}
            <div className="bg-card rounded-2xl p-8 md:p-10 border border-white/8 shadow-2xl shadow-black/30">
                {activeTab === 'price' && (
                    <PriceForm
                        selectedCityId={selectedCityId}
                        onSuccess={() => setSubmitted(true)}
                        onError={setError}
                        isLoading={createPrice.isPending}
                        onSubmit={handlePriceSubmit}
                    />
                )}

                {activeTab === 'scam' && (
                    <ScamForm
                        categories={categories}
                        cities={cities}
                        onSuccess={() => setSubmitted(true)}
                        onError={setError}
                        isLoading={createScam.isPending}
                        onSubmit={handleScamSubmit}
                    />
                )}

                {activeTab === 'vibe' && (
                    <CreateVibeForm
                        showSpotSelect
                        cityId={selectedCityId}
                        onSuccess={() => setSubmitted(true)}
                    />
                )}

                {activeTab === 'spot' && (
                    <SpotForm
                        mode="create"
                        onSubmit={handleSpotSubmit}
                        isLoading={createSpot.isPending}
                        categories={categories}
                        cities={cities}
                        onSuccess={() => setSubmitted(true)}
                        onError={setError}
                        initialData={{
                            cityId: selectedCityId || '',
                        }}
                    />
                )}
            </div>
        </div>
    );
}
