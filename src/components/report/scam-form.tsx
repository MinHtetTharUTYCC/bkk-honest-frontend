'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Upload, X } from 'lucide-react';
import { Dropdown } from '@/components/ui/dropdown';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/core';
import { scamFormValidation, type ScamFormData } from '@/lib/validations/scam-form.validation';

interface ScamFormProps {
    categories: Array<{ id: string; name: string }>;
    cities: Array<{ id: string; name: string }>;
    onSuccess: () => void;
    onError: (message: string) => void;
    isLoading: boolean;
    onSubmit: (data: ScamFormData) => Promise<void>;
}

export default function ScamForm({
    categories,
    cities,
    onSuccess,
    onError,
    isLoading,
    onSubmit,
}: ScamFormProps) {
    const [imagePreview, setImagePreview] = useState('');
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<ScamFormData>({
        resolver: zodResolver(scamFormValidation),
    });

    const scamName = watch('scamName');
    const scamDescription = watch('scamDescription');
    const scamPreventionTip = watch('scamPreventionTip');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                onError('Image size must be less than 10MB');
                return;
            }
            setValue('scamImageFile', file);
            const preview = URL.createObjectURL(file);
            setImagePreview(preview);
        }
    };

    const handleRemoveImage = () => {
        setValue('scamImageFile', null);
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview('');
    };

    const handleFormSubmit = async (data: ScamFormData) => {
        try {
            await onSubmit(data);
            onSuccess();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to publish scam alert';
            console.error(message);
            onError(message);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* Scam Name */}
            <div className="space-y-4">
                <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                    Scam Name
                </label>
                <input
                    {...register('scamName')}
                    placeholder="e.g. Broken Meter Taxi"
                    className={cn(
                        'w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none',
                        (scamName?.length || 0) > 100 && 'border-red-500/50 ring-1 ring-red-500/20',
                    )}
                />
                <div className="flex justify-between items-center">
                    {errors.scamName && (
                        <span className="text-xs text-red-400">{errors.scamName.message}</span>
                    )}
                    <span
                        className={cn(
                            'text-[9px] font-bold tracking-normal transition-colors ml-auto',
                            (scamName?.length || 0) > 100 ? 'text-red-400' : 'text-white/30',
                        )}
                    >
                        {scamName?.length || 0}/100
                    </span>
                </div>
            </div>

            {/* City and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                        City
                    </label>
                    <Dropdown
                        label=""
                        options={cities}
                        value={watch('scamCity')}
                        onChange={(val) => setValue('scamCity', val)}
                        placeholder="Select city..."
                    />
                    {errors.scamCity && (
                        <p className="text-xs text-red-400">{errors.scamCity.message}</p>
                    )}
                </div>

                <div className="space-y-4">
                    <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                        Category
                    </label>
                    <Dropdown
                        label=""
                        options={categories}
                        value={watch('scamCategory')}
                        onChange={(val) => setValue('scamCategory', val)}
                        placeholder="Select category..."
                    />
                    {errors.scamCategory && (
                        <p className="text-xs text-red-400">{errors.scamCategory.message}</p>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
                <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                    Description
                </label>
                <Textarea
                    {...register('scamDescription')}
                    rows={4}
                    placeholder="What happened? Be specific."
                    className={cn(
                        'w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none resize-none',
                        (scamDescription?.length || 0) > 500 &&
                            'border-red-500/50 ring-1 ring-red-500/20',
                    )}
                />
                <div className="flex justify-between items-center">
                    {errors.scamDescription && (
                        <span className="text-xs text-red-400">
                            {errors.scamDescription.message}
                        </span>
                    )}
                    <span
                        className={cn(
                            'text-[9px] font-bold tracking-normal transition-colors ml-auto',
                            (scamDescription?.length || 0) > 500 ? 'text-red-400' : 'text-white/30',
                        )}
                    >
                        {scamDescription?.length || 0}/500
                    </span>
                </div>
            </div>

            {/* Prevention Tip */}
            <div className="space-y-4">
                <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                    Prevention Tip
                </label>
                <Textarea
                    {...register('scamPreventionTip')}
                    rows={3}
                    placeholder="How can others avoid this?"
                    className={cn(
                        'w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none resize-none',
                        (scamPreventionTip?.length || 0) > 300 &&
                            'border-red-500/50 ring-1 ring-red-500/20',
                    )}
                />
                <div className="flex justify-between items-center">
                    {errors.scamPreventionTip && (
                        <span className="text-xs text-red-400">
                            {errors.scamPreventionTip.message}
                        </span>
                    )}
                    <span
                        className={cn(
                            'text-[9px] font-bold tracking-normal transition-colors ml-auto',
                            (scamPreventionTip?.length || 0) > 300
                                ? 'text-red-400'
                                : 'text-white/30',
                        )}
                    >
                        {scamPreventionTip?.length || 0}/300
                    </span>
                </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
                <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                    Image <span className="text-white/50">(Optional)</span>
                </label>

                {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
                        <img
                            src={imagePreview}
                            alt="Scam preview"
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
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleImageChange}
                            disabled={isLoading}
                            className="hidden"
                            aria-label="Upload scam image"
                        />
                        <div
                            className={cn(
                                'border-2 border-dashed rounded-xl p-8 text-center transition-all',
                                'hover:bg-white/5 hover:border-red-400/50',
                                isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                            )}
                        >
                            <Upload
                                size={24}
                                className="text-white/50 group-hover:text-red-400 mx-auto mb-2 transition-colors"
                            />
                            <p className="text-sm text-white/70">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-white/50 mt-1">PNG, JPG, GIF up to 10MB</p>
                        </div>
                    </label>
                )}
            </div>

            <button
                disabled={isLoading}
                className="w-full bg-red-500 text-white py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-400/20 active:scale-[0.98] disabled:opacity-50"
            >
                <AlertCircle size={16} />
                {isLoading ? 'Publishing...' : 'Publish Scam Alert'}
            </button>
        </form>
    );
}
