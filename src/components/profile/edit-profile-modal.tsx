'use client';

import { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateProfile } from '@/hooks/use-api';
import { getApiErrorMessage } from '@/lib/errors/api-error';

const editProfileSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be 50 characters or less'),
    bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
    country: z.string().max(20, 'Country must be 20 characters or less').optional(),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: {
        id: string;
        name?: string | null;
        bio?: string | null;
        country?: string | null;
    };
    onSuccess?: () => void;
}

export function EditProfileModal({ isOpen, onClose, profile, onSuccess }: EditProfileModalProps) {
    const updateProfileMutation = useUpdateProfile();

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<EditProfileFormValues>({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            name: profile?.name ?? '',
            bio: profile?.bio ?? '',
            country: profile?.country ?? '',
        },
    });

    // Sync form values if profile prop changes
    useEffect(() => {
        reset({
            name: profile?.name ?? '',
            bio: profile?.bio ?? '',
            country: profile?.country ?? '',
        });
    }, [profile, reset]);

    const nameValue = watch('name');
    const bioValue = watch('bio');
    const countryValue = watch('country');

    const onSubmit = async (values: EditProfileFormValues) => {
        try {
            await updateProfileMutation.mutateAsync({
                name: values.name,
                bio: values.bio,
                country: values.country,
            });
            toast.success('Profile updated successfully!');
            onSuccess?.();
            onClose();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err) || 'Failed to update profile');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/8 relative animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                    <X size={20} className="text-white/50" />
                </button>

                <div className="flex flex-col gap-1 mb-8">
                    <h3 className="font-display text-2xl font-bold text-white tracking-tight">
                        Edit Profile
                    </h3>
                    <p className="text-white/40 font-medium uppercase tracking-widest text-[10px]">
                        Update your profile information
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Name</label>
                        <input
                            {...register('name')}
                            type="text"
                            placeholder="Your name"
                            maxLength={50}
                            disabled={isSubmitting}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50 transition-colors"
                        />
                        {errors.name ? (
                            <p className="text-xs text-red-400">{errors.name.message}</p>
                        ) : (
                            <p className="text-xs text-white/50">
                                {nameValue?.length ?? 0}/50 characters
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Bio</label>
                        <textarea
                            {...register('bio')}
                            placeholder="Tell us about yourself"
                            maxLength={500}
                            disabled={isSubmitting}
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50 transition-colors resize-none"
                        />
                        {errors.bio ? (
                            <p className="text-xs text-red-400">{errors.bio.message}</p>
                        ) : (
                            <p className="text-xs text-white/50">
                                {bioValue?.length ?? 0}/500 characters
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Country</label>
                        <input
                            {...register('country')}
                            type="text"
                            placeholder="Your country"
                            maxLength={20}
                            disabled={isSubmitting}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50 transition-colors"
                        />
                        {errors.country ? (
                            <p className="text-xs text-red-400">{errors.country.message}</p>
                        ) : (
                            <p className="text-xs text-white/50">
                                {countryValue?.length ?? 0}/20 characters
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-6 py-3 rounded-full border border-white/10 text-white/80 hover:bg-white/5 disabled:opacity-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 rounded-full bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-50 transition-colors font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
