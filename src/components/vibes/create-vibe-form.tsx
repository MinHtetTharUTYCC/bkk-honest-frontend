'use client';

import { useState } from 'react';
import { useCreateLiveVibe } from '@/hooks/use-api';
import { Zap, Loader2 } from 'lucide-react';
import SearchableSpotSelect from '@/components/spots/searchable-spot-select';
import { toast } from 'sonner';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/lib/errors/api-error';
import { liveVibesControllerFindAllResponse } from '@/api/generated/live-vibes/live-vibes';
import { LiveVibeDto, PaginatedLiveVibesDto } from '@/api/generated/model';

interface CreateVibeFormProps {
    spotId?: string;
    cityId?: string;
    showSpotSelect?: boolean;
    onSuccess?: () => void;
}

export default function CreateVibeForm({
    spotId: initialSpotId,
    cityId,
    showSpotSelect = false,
    onSuccess,
}: CreateVibeFormProps) {
    const [selectedSpotId, setSelectedSpotId] = useState(initialSpotId || '');
    const [crowdLevel, setCrowdLevel] = useState(3);
    const [waitTime, setWaitTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const createVibeMutation = useCreateLiveVibe();
    const queryClient = useQueryClient();

    const handleSubmit = async () => {
        const finalSpotId = selectedSpotId || initialSpotId;
        if (!finalSpotId) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await createVibeMutation.mutateAsync({
                spotId: finalSpotId,
                crowdLevel,
                waitTimeMinutes: waitTime ? Number(waitTime) : undefined,
            });

            const newVibe = response?.data as LiveVibeDto;

            // Update the infinite query cache to show new vibe at index 0
            queryClient.setQueryData<InfiniteData<liveVibesControllerFindAllResponse>>(
                ['live-vibes-infinite', { spotId: finalSpotId }],
                (oldData) => {
                    if (!oldData || !oldData.pages) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page, i) => {
                            if (i !== 0) return page;
                            const pageData = page.data as PaginatedLiveVibesDto;
                            return {
                                ...page,
                                data: {
                                    ...pageData,
                                    data: [newVibe, ...(pageData.data ?? [])],
                                },
                            };
                        }),
                    } as InfiniteData<liveVibesControllerFindAllResponse>;
                },
            );

            setWaitTime('');
            setCrowdLevel(3);
            if (showSpotSelect) setSelectedSpotId('');
            onSuccess?.();
            toast.success('Vibe checked in!');
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err) || 'Failed to check in vibe');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {showSpotSelect && (
                <SearchableSpotSelect
                    name="spotId"
                    required
                    placeholder="Search spots..."
                    cityId={cityId}
                    onSelect={(id) => setSelectedSpotId(id)}
                />
            )}

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">
                    Check In Your Vibe
                </p>
                <div className="space-y-3">
                    {/* Crowd Level Slider */}
                    <div>
                        <label className="text-[10px] font-semibold text-white/50 uppercase tracking-widest block mb-2">
                            Crowd Level: {crowdLevel}/5
                        </label>
                        <input
                            type="range"
                            min={1}
                            max={5}
                            step={1}
                            value={crowdLevel}
                            onChange={(e) => setCrowdLevel(Number(e.target.value))}
                            className="w-full accent-amber-400"
                        />
                        <div className="flex justify-between text-xs font-semibold text-white/30 mt-1 uppercase tracking-widest">
                            <span>Empty</span>
                            <span>Moderate</span>
                            <span>Packed</span>
                        </div>
                    </div>

                    {/* Wait Time Input */}
                    <div>
                        <label className="text-[10px] font-semibold text-white/50 uppercase tracking-widest block mb-2">
                            Wait Time (minutes, optional)
                        </label>
                        <input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={waitTime}
                            onChange={(e) => setWaitTime(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="button"
                        disabled={isSubmitting || (!selectedSpotId && !initialSpotId)}
                        onClick={handleSubmit}
                        className="w-full bg-amber-500 text-black py-3 rounded-xl text-xs font-semibold tracking-wide hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Zap size={14} fill="currentColor" />
                        )}
                        {isSubmitting ? 'Submitting...' : 'Submit Vibe'}
                    </button>
                </div>
            </div>
        </div>
    );
}
