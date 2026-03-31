'use client';

import { Suspense, useEffect, use } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useVisitProfile } from '@/hooks/use-api';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProfileUserInfo } from '@/components/profile/profile-user-info';
import { ProfileTabsNav } from '@/components/profile/profile-tabs-nav';
import { ProfileResponseDto } from '@/api/generated/model/profileResponseDto';
import { Button } from '@/components/ui/button';

function ProfileLayoutContent({
    params,
    children,
}: {
    params: Promise<{ userId: string }>;
    children: React.ReactNode;
}) {
    const { userId } = use(params);
    const { user: currentUser, loading: authLoading } = useAuth();
    const router = useRouter();

    // Redirect if viewing own profile or explicit "me" path
    useEffect(() => {
        if (!authLoading) {
            if (userId === 'me' || (currentUser && currentUser.id === userId)) {
                router.replace('/profile/tips');
            }
        }
    }, [currentUser, userId, authLoading, router]);

    // Fetch user profile data
    const { data, isLoading: isProfileLoading, error: profileError } = useVisitProfile(userId);
    const profile = data as ProfileResponseDto | undefined;

    const isProfileNotFound =
        (profileError as { response?: { status?: number } })?.response?.status === 404;

    if (isProfileLoading || authLoading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-black via-slate-950 to-black pt-20 flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={40} />
            </div>
        );
    }

    if (isProfileNotFound || !profile) {
        return (
            <div className="min-h-screen bg-linear-to-b from-black via-slate-950 to-black pt-20 px-4 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Profile Not Found</h2>
                    <p className="text-white/60 mb-6">
                        The profile you&apos;re looking for doesn&apos;t exist or has been deleted.
                    </p>
                    <Button
                        onClick={() => router.back()}
                        className="text-amber-400 hover:text-amber-300 underline"
                    >
                        Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-black via-slate-950 to-black">
            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* User Info Header with shared component */}
                <ProfileUserInfo
                    userId={userId}
                    profile={profile}
                    isPublic={true}
                    isLoading={isProfileLoading}
                />

                {/* Tab Navigation */}
                <ProfileTabsNav userId={userId} />

                {/* Tab Content */}
                <div className="pb-20">{children}</div>
            </div>
        </div>
    );
}

export default function ProfileLayout({
    params,
    children,
}: {
    params: Promise<{ userId: string }>;
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<div className="animate-pulse h-screen bg-white/5 rounded-2xl m-4" />}>
            <ProfileLayoutContent params={params}>{children}</ProfileLayoutContent>
        </Suspense>
    );
}
