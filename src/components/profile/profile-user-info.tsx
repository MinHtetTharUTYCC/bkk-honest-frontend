"use client";

import {
  MapPin,
  Calendar,
  Zap,
  Share2,
  MoreVertical,
  Flag,
  Edit2,
  User,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import ReportButton from "@/components/report/report-button";
import { useState } from "react";

interface ProfileData {
  id?: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  level?: string;
  country?: string;
  createdAt?: string;
  reputation?: number;
}

interface ProfileUserInfoProps {
  /** User ID to display profile for. Use "me" for authenticated user */
  userId: string | "me";
  /** Profile data to display */
  profile: ProfileData | null | undefined;
  /** Whether this is a public profile (visited user) */
  isPublic: boolean;
  /** Whether profile is loading */
  isLoading?: boolean;
  /** Callback when edit button is clicked */
  onEditClick?: () => void;
  /** Callback when upload avatar button is clicked */
  onUploadClick?: () => void;
}

export function ProfileUserInfo({
  userId,
  profile,
  isPublic,
  isLoading,
  onEditClick,
  onUploadClick,
}: ProfileUserInfoProps) {
  const [shareLoading, setShareLoading] = useState(false);

  const handleShare = async () => {
    setShareLoading(true);
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      const shareData = {
        title: `${profile?.name}'s Profile`,
        text: `Check out ${profile?.name}'s pulse on BKK Honest! ⚡`,
        url: url,
      };

      try {
        if (
          typeof navigator !== "undefined" &&
          navigator.share &&
          navigator.canShare?.(shareData)
        ) {
          await navigator.share(shareData);
        } else {
          throw new Error("Native share unavailable");
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.warn("Native share failed, trying clipboard:", err);

        if (
          typeof navigator !== "undefined" &&
          navigator.clipboard &&
          window.isSecureContext
        ) {
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
      }
    } catch (clipErr) {
      console.error("All sharing methods failed:", clipErr);
      toast.error("Failed to copy link");
    } finally {
      setShareLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-start mb-6">
        {/* Share/Report Actions - shown for public profiles */}
        {isPublic && (
          <div className="flex gap-2 items-center">
            {/* Share Button - Now with more prominent styling */}
            <button
              onClick={handleShare}
              disabled={shareLoading}
              className="p-2.5 hover:bg-amber-400/10 rounded-full transition-colors disabled:opacity-50 border border-white/10 hover:border-amber-400/50"
              title="Share profile"
            >
              <Share2
                size={18}
                className="text-white/60 hover:text-amber-400"
              />
            </button>

            {/* Report in Dropdown Menu */}
            <DropdownMenu
              trigger={
                <button className="p-2.5 hover:bg-white/10 rounded-full transition-colors border border-white/10">
                  <MoreVertical
                    size={18}
                    className="text-white/60 hover:text-white"
                  />
                </button>
              }
            >
              <DropdownMenuItem>
                <ReportButton
                  targetId={userId}
                  reportType="PROFILE"
                  className="w-full text-left text-red-400 hover:bg-red-400/10"
                >
                  <Flag size={14} className="mr-2" />
                  Report Profile
                </ReportButton>
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        )}

        {/* Edit Button - shown for own profile */}
        {!isPublic && onEditClick && (
          <button
            onClick={onEditClick}
            className="group bg-amber-400 text-black px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-300 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Edit2 size={14} className="text-black" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Avatar */}
        <div className="h-24 w-24 rounded-2xl overflow-hidden shrink-0 bg-white/5 border border-white/10 relative group cursor-pointer">
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

          {/* Upload overlay - shown for own profile */}
          {!isPublic && onUploadClick && (
            <div
              onClick={onUploadClick}
              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="text-white text-xs font-bold">Change</span>
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
  );
}
