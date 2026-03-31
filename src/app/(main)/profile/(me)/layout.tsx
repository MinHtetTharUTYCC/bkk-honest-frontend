'use client';

import { Suspense, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useMyProfile } from '@/hooks/use-api';
import { ProfileUserInfo } from '@/components/profile/profile-user-info';
import { EditProfileModal } from '@/components/profile/edit-profile-modal';
import { Loader2 } from 'lucide-react';
import { ProfileResponseDto } from '@/api/generated/model';

function ProfileLayoutContent({ children }: { children: React.ReactNode }) {
    const { loading: authLoading } = useAuth();
    const { data, isLoading: profileLoading, refetch: refetchProfile } = useMyProfile();
    const profile = data as ProfileResponseDto | undefined;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (authLoading || profileLoading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-black via-slate-950 to-black pt-20 flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={40} />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-linear-to-b from-black via-slate-950 to-black pt-20 px-4 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Profile Not Found</h2>
                    <p className="text-white/60 mb-6">
                        Could not load your profile. Please try again.
                    </p>
                </div>
            </div>
        );
    }

    const handleEditClick = () => {
        setIsEditModalOpen(true);
    };

    const handleUploadClick = () => {
        console.log('Upload avatar clicked');
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-black via-slate-950 to-black">
            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* User Info Header */}
                <ProfileUserInfo
                    userId="me"
                    profile={profile}
                    isPublic={false}
                    isLoading={profileLoading}
                    onEditClick={handleEditClick}
                    onUploadClick={handleUploadClick}
                />

                {/* Edit Profile Modal */}
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    profile={{
                        id: profile.id,
                        name: profile.name,
                        bio: profile.bio,
                        country: profile.country,
                    }}
                    onSuccess={refetchProfile}
                />

                {/* Tab Content */}
                <div className="pb-20">{children}</div>
            </div>
        </div>
    );
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="animate-pulse h-screen bg-white/5 rounded-2xl m-4" />}>
            <ProfileLayoutContent>{children}</ProfileLayoutContent>
        </Suspense>
    );
}
