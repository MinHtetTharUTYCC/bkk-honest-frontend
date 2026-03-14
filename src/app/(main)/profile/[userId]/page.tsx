'use client';

import { useAuth } from '@/components/providers/auth-provider';
import {
    useProfile,
    useInfiniteUserScamAlerts,
    useInfiniteUserCommunityTips,
    useInfiniteUserSpots,
} from '@/hooks/use-api';
import {
    Zap,
    MapPin,
    Calendar,
    ArrowRight,
    Loader2,
    AlertTriangle,
    Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { useInView } from 'react-intersection-observer';
import { getSpotUrl, getScamAlertUrl } from '@/lib/slug';

export default function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params);
    const { user: currentUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Redirect if viewing own profile
    useEffect(() => {
        if (!authLoading && currentUser && currentUser.id === userId) {
            router.push('/profile');
        }
    }, [currentUser, userId, authLoading, router]);

    // Tab State maintained via URL
    const activeTab = (searchParams.get('tab') as 'scams' | 'tips' | 'spots') || 'spots';

    const setActiveTab = (tab: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.replace(`/profile/${userId}?${params.toString()}`, { scroll: false });
    };

    // Fetch user profile data
    const {
        data: profileResponse,
        isLoading: profileLoading,
        error: profileError,
    } = useProfile(userId);
    const profile = profileResponse?.data || profileResponse;

    const isProfileNotFound = (profileError as any)?.response?.status === 404;

    const { ref, inView } = useInView();

    // Fetch user's content
    const {
        data: scamsData,
        fetchNextPage: fetchNextScams,
        hasNextPage: hasNextScams,
        isFetchingNextPage: isFetchingScams,
    } = useInfiniteUserScamAlerts(userId);

    const {
        data: tipsData,
        fetchNextPage: fetchNextTips,
        hasNextPage: hasNextTips,
        isFetchingNextPage: isFetchingTips,
    } = useInfiniteUserCommunityTips(userId);

    const {
        data: spotsData,
        fetchNextPage: fetchNextSpots,
        hasNextPage: hasNextSpots,
        isFetchingNextPage: isFetchingSpots,
    } = useInfiniteUserSpots(userId);

    // Infinite scroll handler
    useEffect(() => {
        if (!inView) return;

        if (activeTab === 'scams' && hasNextScams) {
            fetchNextScams();
        } else if (activeTab === 'tips' && hasNextTips) {
            fetchNextTips();
        } else if (activeTab === 'spots' && hasNextSpots) {
            fetchNextSpots();
        }
    }, [inView, activeTab, hasNextScams, hasNextTips, hasNextSpots, fetchNextScams, fetchNextTips, fetchNextSpots]);

    // Flatten paginated data
    const scams = scamsData?.pages?.flatMap((page) => page.data || []) || [];
    const tips = tipsData?.pages?.flatMap((page) => page.data || []) || [];
    const spots = spotsData?.pages?.flatMap((page) => page.data || []) || [];

    if (profileLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black pt-20 flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={40} />
            </div>
        );
    }

    if (isProfileNotFound || !profile) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black pt-20">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">User Not Found</h1>
                    <p className="text-white/60 mb-8">This user's profile doesn't exist or has been deleted.</p>
                    <Link href="/" className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-2">
                        Back to Home <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black pt-20">
            <div className="max-w-4xl mx-auto px-4">
                {/* Profile Header */}
                <div className="space-y-6 mb-12">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                        {/* Avatar */}
                        <div className="h-24 w-24 rounded-2xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
                            {profile?.avatarUrl ? (
                                <img
                                    src={profile.avatarUrl}
                                    alt={profile.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                    <MapPin size={40} />
                                </div>
                            )}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-bold text-white">{profile?.name || 'User'}</h1>
                                {profile?.level && (
                                    <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/50 text-amber-300 rounded-full text-xs font-bold uppercase tracking-widest">
                                        {profile.level}
                                    </span>
                                )}
                            </div>

                            {profile?.bio && (
                                <p className="text-white/60 mb-3">{profile.bio}</p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-white/50">
                                {profile?.country && (
                                    <div className="flex items-center gap-1">
                                        <MapPin size={16} />
                                        {profile.country}
                                    </div>
                                )}
                                {profile?.createdAt && (
                                    <div className="flex items-center gap-1">
                                        <Calendar size={16} />
                                        Joined {new Date(profile.createdAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reputation */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-bold text-amber-400">{profile?.reputation || 0}</div>
                            <div className="text-xs text-white/50 uppercase tracking-widest mt-1">Reputation</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-white/10 mb-12">
                    <div className="flex gap-8 overflow-x-auto">
                        {['spots', 'tips', 'scams'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    'px-4 py-3 text-sm font-semibold uppercase tracking-widest transition-all whitespace-nowrap',
                                    activeTab === tab
                                        ? 'text-white border-b-2 border-amber-400'
                                        : 'text-white/50 hover:text-white/70',
                                )}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="pb-20">
                    {/* Spots Tab */}
                    {activeTab === 'spots' && (
                        <div className="space-y-6">
                            {spots.length === 0 ? (
                                <div className="py-12 text-center text-white/40">
                                    <Target size={32} className="mx-auto mb-3 opacity-50" />
                                    <p>No spots shared yet</p>
                                </div>
                            ) : (
                                spots.map((spot: any) => (
                                    <Link
                                        key={spot.id}
                                        href={getSpotUrl(spot.city?.slug || '', spot.slug)}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors group cursor-pointer"
                                    >
                                        <div className="flex items-start gap-4">
                                            {spot.imageUrl && (
                                                <div className="h-20 w-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                                                    <img
                                                        src={spot.imageUrl}
                                                        alt={spot.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-white mb-1">{spot.name}</h3>
                                                <p className="text-sm text-white/60 mb-2">{spot.address}</p>
                                                <div className="flex items-center gap-2 text-amber-400">
                                                    <Zap size={14} />
                                                    <span className="text-xs font-semibold">
                                                        {spot.vibeStats?.avgCrowdLevel?.toFixed(1)}/5 Busy
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                            {isFetchingSpots && <Loader2 className="animate-spin mx-auto mt-6 text-white/50" />}
                            <div ref={ref} />
                        </div>
                    )}

                    {/* Tips Tab */}
                    {activeTab === 'tips' && (
                        <div className="space-y-4">
                            {tips.length === 0 ? (
                                <div className="py-12 text-center text-white/40">
                                    <Loader2 size={32} className="mx-auto mb-3 opacity-50" />
                                    <p>No tips shared yet</p>
                                </div>
                            ) : (
                                tips.map((tip: any) => (
                                    <div
                                        key={tip.id}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors"
                                    >
                                        <h3 className="text-lg font-semibold text-white mb-2">{tip.title}</h3>
                                        <p className="text-white/60 text-sm line-clamp-3 mb-3">{tip.description}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-white/40 text-xs">
                                                <Calendar size={14} />
                                                {new Date(tip.createdAt).toLocaleDateString()}
                                            </div>
                                            {tip.commentsCount > 0 && (
                                                <div className="text-amber-400 text-xs font-semibold">
                                                    {tip.commentsCount} {tip.commentsCount === 1 ? 'comment' : 'comments'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            {isFetchingTips && <Loader2 className="animate-spin mx-auto mt-6 text-white/50" />}
                            <div ref={ref} />
                        </div>
                    )}

                    {/* Scams Tab */}
                    {activeTab === 'scams' && (
                        <div className="space-y-4">
                            {scams.length === 0 ? (
                                <div className="py-12 text-center text-white/40">
                                    <AlertTriangle size={32} className="mx-auto mb-3 opacity-50" />
                                    <p>No scam alerts reported yet</p>
                                </div>
                            ) : (
                                scams.map((scam: any) => (
                                    <Link
                                        key={scam.id}
                                        href={getScamAlertUrl(scam.city?.slug || '', scam.slug)}
                                        className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 hover:bg-red-500/10 transition-colors group cursor-pointer"
                                    >
                                        <div className="flex items-start gap-4">
                                            {scam.imageUrl && (
                                                <div className="h-20 w-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                                                    <img
                                                        src={scam.imageUrl}
                                                        alt={scam.scamName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-semibold text-white">{scam.scamName}</h3>
                                                </div>
                                                <p className="text-sm text-white/60 line-clamp-2">{scam.description}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                            {isFetchingScams && <Loader2 className="animate-spin mx-auto mt-6 text-white/50" />}
                            <div ref={ref} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
