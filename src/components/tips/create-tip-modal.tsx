'use client';

import { Zap, X } from 'lucide-react';
import { useCreateCommunityTip } from '@/hooks/use-api';
import { toast } from 'sonner';
import TipForm from './tip-form';
import { TipFormValues } from '@/lib/validations/tip';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import {
    CommunityTipResponseDtoType,
    PaginatedCommunityTipsResponseDto,
    type CommunityTipResponseDto,
} from '@/api/generated/model';
import { getApiErrorMessage } from '@/lib/errors/api-error';
import { communityTipsControllerFindBySpotResponse } from '@/api/generated/community-tips/community-tips';

const sortTypes = ['popular', 'newest'] as const; // TODO - extract from api
const tipTypes = [CommunityTipResponseDtoType.TRY, CommunityTipResponseDtoType.AVOID];

interface CreateTipModalProps {
    spotId: string;
    onClose: () => void;
}

export default function CreateTipModal({ spotId, onClose }: CreateTipModalProps) {
    const createMutation = useCreateCommunityTip();
    const queryClient = useQueryClient();

    const onFormSubmit = async (values: TipFormValues) => {
        try {
            const response = await createMutation.mutateAsync({
                spotId,
                ...values,
            });

            if (!response || !('type' in (response as unknown as Record<string, unknown>))) {
                window.alert('Failed to create tip');
                return;
            }

            const newTip = response as unknown as CommunityTipResponseDto;

            // Manually update the infinite query cache to show the new tip at index 0 immediately
            // This works for both 'newest' and 'popular' sort modes by forcefully prepending
            tipTypes.forEach((type) => {
                sortTypes.forEach((sort) => {
                    queryClient.setQueryData<
                        InfiniteData<communityTipsControllerFindBySpotResponse>
                    >(['tips-infinite', spotId, type, sort], (oldData) => {
                        if (!oldData || !oldData.pages) return oldData;
                        if (newTip.type !== type) return oldData;

                        return {
                            ...oldData,
                            pages: oldData.pages.map((page, i) => {
                                if (i !== 0) return page; // only update the first page to avoid duplicates
                                const pageData = page.data as PaginatedCommunityTipsResponseDto;
                                return {
                                    ...page,
                                    data: {
                                        ...pageData,
                                        items: [newTip, ...(pageData.data ?? [])],
                                    },
                                };
                            }),
                        } as InfiniteData<communityTipsControllerFindBySpotResponse>;
                    });
                });
            });

            toast.success('Tip shared with the community!');
            onClose();
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error) || 'Failed to share tip');
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6">
            <div
                className="absolute inset-0 bg-black/75 backdrop-blur-xl transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-xl bg-card rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <header className="p-8 border-b border-white/8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-black shadow-xl shadow-amber-400/20">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <div>
                            <h3 className="font-display text-xl font-bold text-foreground tracking-tight">
                                Share a Tip
                            </h3>
                            <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                                Help the community pulse
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-white/40 hover:text-foreground transition-colors"
                    >
                        <X size={20} strokeWidth={3} />
                    </button>
                </header>

                <div className="p-8">
                    <TipForm
                        onSubmit={onFormSubmit}
                        isLoading={createMutation.isPending}
                        submitLabel="Publish Tip"
                    />
                </div>
            </div>
        </div>
    );
}
