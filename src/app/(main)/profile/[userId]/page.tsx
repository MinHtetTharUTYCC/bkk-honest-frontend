'use client';
import { Suspense } from 'react';

import { useAuth } from '@/components/providers/auth-provider';
import {
    useProfile,
    useInfiniteUserScamAlerts,
    useInfiniteUserCommunityTips,
    useInfiniteUserSpots,
} from '@/hooks/use-api';
import { Zap, MapPin, Calendar, ArrowRight, Loader2, AlertTriangle, Target, MoreVertical, Flag, Share2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { useInView } from 'react-intersection-observer';
import { getSpotUrl, getScamAlertUrl } from '@/lib/slug';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import ReportButton from '@/components/report/report-button';

function UserProfilePageContent({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params);
    const { user: currentUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Redirect if viewing own profile
    useEffect(() => {
        if (!authLoading && currentUser && currentUser.id === userId) {
            router.replace('/profile');
        }
    }, [currentUser, userId, authLoading, router]);

    // Tab State maintained via URL
    const activeTab =
        (searchParams.get('tab') as 'scams' | 'reports' | 'tips' | 'spots') || 'spots';

    const setActiveTab = (tab: 'scams' | 'reports' | 'tips' | 'spots') => {
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

    if (profileLoading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-black via-slate-950 to-black pt-20 flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={40} />
            </div>
        );
    }

    if (isProfileNotFound || !profile) {
        return (
            <div className="min-h-screen bg-linear-to-b from-black via-slate-950 to-black pt-20">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">User Not Found</h1>
                    <p className="text-white/60 mb-8">
                        This user's profile doesn't exist or has been deleted.
                    </p>
                    <Link
                        href="/"
                        className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-2"
                    >
                        Back to Home <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-black via-slate-950 to-black pt-20">
            <div className="max-w-4xl mx-auto px-4">
                {/* Profile Header */}
                <div className="relative mb-12">
                    {/* Top right 3-dots */}
                    {currentUser && currentUser.id !== userId && (
                        <div className="absolute top-0 right-0 z-10">
                            <DropdownMenu
                                trigger={
                                    <button className="p-3 hover:bg-white/10 rounded-xl text-white transition-colors bg-white/5 border border-white/10 flex items-center justify-center shadow-sm">
                                        <MoreVertical size={18} />
                                    </button>
                                }
                            >
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: `${profile?.name}'s Profile`,
                                                text: `Check out ${profile?.name}'s pulse on BKK Honest! ⚡`,
                                                url: window.location.href
                                            });
                                        }
                                    }}
                                    className="gap-3 py-3"
                                >
                                    <Share2 size={16} className="text-amber-400" />
                                    <span className="text-sm font-medium">Share Profile</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <ReportButton
                                        targetId={userId}
                                        reportType="PROFILE"
                                        className="w-full flex items-center justify-start gap-3 px-4 py-3 text-sm font-medium hover:bg-white/5 transition-colors border-none text-white/70 hover:text-white"
                                    >
                                        <Flag size={16} />
                                        <span>Report Profile</span>
                                    </ReportButton>
                                </DropdownMenuItem>
                            </DropdownMenu>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        {/* Avatar */}
                        <div className="h-24 w-24 rounded-2xl overflow-hidden shrink-0 bg-white/5 border border-white/10">
                            {profile?.avatarUrl ? (
                                <img
                                    src={profile.avatarUrl}
                                    alt={profile.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                    <User size={40} />
                                </div>
                            )}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 w-full pt-1 sm:pt-0">
                            <div className="flex items-center gap-3 mb-2 pr-14">
                                <h1 className="text-3xl sm:text-4xl font-bold text-white truncate">
                                    {profile?.name || 'User'}
                                </h1>
                                {profile?.level && (
                                    <span className="shrink-0 px-3 py-1 bg-amber-500/20 border border-amber-400/50 text-amber-300 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                                        {profile.level}
                                    </span>
                                )}
                            </div>

                            {profile?.bio && <p className="text-white/60 mb-4 max-w-lg leading-relaxed text-sm sm:text-base">{profile.bio}</p>}

                            <div className="flex flex-wrap gap-4 text-sm text-white/50 mb-6">
                                {profile?.country && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={16} />
                                        {profile.country}
                                    </div>
                                )}
                                {profile?.createdAt && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={16} />
                                        Joined {new Date(profile.createdAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            {/* Reputation Badge */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-black px-6 py-3 rounded-2xl shadow-xl shadow-amber-400/20">
                                    <Zap size={18} fill="currentColor" />
                                    <span className="text-sm font-black uppercase tracking-widest">
                                        {profile?.reputation || 0} Rep
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contribution History Tabs */}
                <div className="pb-20">
                    <ProfileTabs
                        userId={userId}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        isPublic={true}
                    />
                </div>
            </div>
        </div>
    );
}


export default function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  return (
    <Suspense fallback={<div className="animate-pulse h-screen bg-white/5 rounded-2xl m-4" />}>
      <UserProfilePageContent params={params} />
    </Suspense>
  );
}
