"use client";

import { Suspense, useEffect, use } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useProfile } from "@/hooks/use-api";
import {
  Zap,
  MapPin,
  Calendar,
  MoreVertical,
  Flag,
  Share2,
  User,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import ReportButton from "@/components/report/report-button";
import { ProfileTabsNav } from "@/components/profile/profile-tabs-nav";
import { toast } from "sonner";

interface ApiError {
  response?: {
    status?: number;
  };
}

interface ProfileData {
  name?: string;
  avatarUrl?: string;
  level?: string;
  bio?: string;
  country?: string;
  createdAt?: string;
  reputation?: number;
}

function unwrapProfileData(payload: unknown): ProfileData | null {
  const unwrapped =
    payload && typeof payload === "object" && "data" in payload
      ? (payload as { data?: unknown }).data ?? payload
      : payload;

  if (!unwrapped || typeof unwrapped !== "object") {
    return null;
  }

  return unwrapped as ProfileData;
}

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

  // Redirect if viewing own profile
  useEffect(() => {
    if (!authLoading && currentUser && currentUser.id === userId) {
      router.replace("/profile");
    }
  }, [currentUser, userId, authLoading, router]);

  // Fetch user profile data
  const {
    data: profileResponse,
    isLoading: profileLoading,
    error: profileError,
  } = useProfile(userId);
  const profile = unwrapProfileData(profileResponse);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `${profile?.name}'s Profile`,
      text: `Check out ${profile?.name}'s pulse on BKK Honest! ⚡`,
      url: url,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        throw new Error("Native share unavailable");
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.warn("Native share failed, trying clipboard:", err);

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard!");
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = url;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const successful = document.execCommand("copy");
          document.body.removeChild(textArea);
          if (successful) {
            toast.success("Link copied to clipboard!");
          } else {
            throw new Error("Copy command failed");
          }
        }
      } catch (clipErr) {
        console.error("All sharing methods failed:", clipErr);
        toast.error("Failed to copy link");
      }
    }
  };

  const isProfileNotFound =
    (profileError as ApiError)?.response?.status === 404;

  if (profileLoading) {
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
            The profile you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/discover" className="text-amber-400 hover:text-amber-300 underline">
            Back to Discover
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-black via-slate-950 to-black">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            {/* Share/Report Menu */}
            {currentUser?.id !== userId && (
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Share profile"
                >
                  <Share2 size={18} className="text-white/60 hover:text-white" />
                </button>

                <DropdownMenu>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <MoreVertical size={18} className="text-white/60 hover:text-white" />
                  </button>
                  <DropdownMenuItem>
                    <ReportButton
                      type="profile"
                      resourceId={userId}
                      resourceName={profile?.name}
                      buttonClassName="w-full text-left text-red-400 hover:bg-red-400/10"
                    >
                      <Flag size={14} className="mr-2" />
                      Report Profile
                    </ReportButton>
                  </DropdownMenuItem>
                </DropdownMenu>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="h-24 w-24 rounded-2xl overflow-hidden shrink-0 bg-white/5 border border-white/10 relative">
              {profile?.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.name || "User avatar"}
                  fill
                  className="object-cover"
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
                  {profile?.name || "User"}
                </h1>
                {profile?.level && (
                  <span className="shrink-0 px-3 py-1 bg-amber-500/20 border border-amber-400/50 text-amber-300 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                    {profile.level}
                  </span>
                )}
              </div>

              {profile?.bio && (
                <p className="text-white/60 mb-4 max-w-lg leading-relaxed text-sm sm:text-base">
                  {profile.bio}
                </p>
              )}

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
    <Suspense
      fallback={
        <div className="animate-pulse h-screen bg-white/5 rounded-2xl m-4" />
      }
    >
      <ProfileLayoutContent params={params}>{children}</ProfileLayoutContent>
    </Suspense>
  );
}
