"use client";
import { Suspense, useState, useEffect, useRef } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import {
  useMyProfile,
  useInfiniteUserPriceReports,
  useInfiniteUserScamAlerts,
  useInfiniteUserCommunityTips,
  useInfiniteUserSpots,
  useMissionStats,
} from "@/hooks/use-api";
import {
  Zap,
  MapPin,
  Calendar,
  LogOut,
  Loader2,
  Edit2,
  Save,
  X,
  Camera,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import LoginRequired from "@/components/auth/login-required";
import { Textarea } from "@/components/ui/textarea";

interface ApiError {
  response?: {
    status?: number;
  };
}

interface ProfileData {
  id?: string;
  name?: string;
  bio?: string;
  country?: string;
  avatarUrl?: string;
  level?: string;
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

interface PageWithPagination {
  pagination?: {
    total?: number;
  };
}

function ProfilePageContent() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Tab State maintained via URL
  const activeTab =
    (searchParams.get("tab") as "scams" | "reports" | "tips" | "spots") ||
    "scams";

  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/profile?${params.toString()}`, { scroll: false });
  };

  // Use the dedicated 'me' hook for the authenticated user
  const {
    data: profileResponse,
    isLoading: profileLoading,
    error: profileError,
  } = useMyProfile();
  const profile = unwrapProfileData(profileResponse);
  const { data: missionStats } = useMissionStats();

  const isProfileNotFound =
    (profileError as ApiError)?.response?.status === 404;

  useEffect(() => {
    if (isProfileNotFound && user) {
      const createProfile = async () => {
        try {
          await api.post("/profiles", {
            name:
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "Pulse Scout",
            avatarUrl: user.user_metadata?.avatar_url || "",
          });
          queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
        } catch (err) {
          console.error("Failed to auto-create profile:", err);
        }
      };
      createProfile();
    }
  }, [isProfileNotFound, user, queryClient]);

  const userId = user ? "me" : "";

  const { data: reportsData } = useInfiniteUserPriceReports(userId);
  const { data: scamsData } = useInfiniteUserScamAlerts(userId);
  const { data: tipsData } = useInfiniteUserCommunityTips(userId);
  const { data: spotsData } = useInfiniteUserSpots(userId);

  const reportsTotal = (reportsData?.pages?.[0] as PageWithPagination | undefined)?.pagination?.total || 0;
  const scamsTotal = (scamsData?.pages?.[0] as PageWithPagination | undefined)?.pagination?.total || 0;
  const tipsTotal = (tipsData?.pages?.[0] as PageWithPagination | undefined)?.pagination?.total || 0;
  const spotsTotal = (spotsData?.pages?.[0] as PageWithPagination | undefined)?.pagination?.total || 0;

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Initialize edit state when profile loads
  useEffect(() => {
    if (profile) {
      setEditName(profile.name || "");
      setEditBio(profile.bio || "");
      setEditCountry(profile.country || "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      setSaveError(null);
      setIsSaving(true);
      await api.patch("/profiles/me", {
        name: editName,
        bio: editBio,
        country: editCountry,
      });
      await queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setSaveError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) return;
    try {
      setUploadError(null);
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", selectedFile);

      await api.patch("/profiles/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      setUploadError("Failed to upload avatar. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!isClient || authLoading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="h-64 bg-white/5 rounded-2xl" />
        <div className="h-96 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return <LoginRequired />;
  }

  if (profileLoading || (isProfileNotFound && user)) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="h-64 bg-white/5 rounded-2xl" />
        <div className="h-96 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 px-4 sm:px-0">
      {/* Avatar Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center">
            <h3 className="font-display text-xl font-bold text-foreground tracking-tight mb-6">
              Confirm Avatar
            </h3>
            <div className="w-48 h-48 rounded-full border-4 border-amber-400/50 shadow-2xl shadow-amber-400/20 overflow-hidden mb-8 relative">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setUploadError(null);
                }}
                disabled={isUploading}
                className="flex-1 py-3 px-4 rounded-2xl bg-white/8 text-white/40 font-bold uppercase tracking-widest text-xs hover:bg-white/15 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadAvatar}
                disabled={isUploading}
                className="flex-1 py-3 px-4 rounded-2xl bg-amber-400 text-black font-bold uppercase tracking-widest text-xs hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Looks Good"
                )}
              </button>
            </div>
            {uploadError && (
              <p className="mt-4 text-xs text-red-400 text-center font-medium">
                {uploadError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-white/8 relative">
            <button
              onClick={() => {
                setIsEditing(false);
                setSaveError(null);
              }}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/8 transition-colors"
            >
              <X size={20} className="text-white/40" />
            </button>

            <h3 className="font-display text-2xl font-bold text-foreground tracking-tight mb-8">
              Edit Profile
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-lg font-bold text-foreground focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all placeholder:text-white/20"
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                  Your Bio
                </label>
                <Textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-medium text-white/70 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all placeholder:text-white/20 min-h-30 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                  Country (optional)
                </label>
                <input
                  type="text"
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-medium text-white/70 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all placeholder:text-white/20"
                  placeholder="e.g. Thailand, Japan, USA…"
                />
              </div>

              {saveError && (
                <p className="text-xs text-red-400 font-medium">{saveError}</p>
              )}

              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setSaveError(null);
                  }}
                  disabled={isSaving}
                  className="flex-1 py-4 px-6 rounded-2xl bg-white/8 text-white/40 font-bold uppercase tracking-widest text-xs hover:bg-white/15 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 py-4 px-6 rounded-2xl bg-amber-400 text-black font-bold uppercase tracking-widest text-xs hover:bg-amber-300 transition-all shadow-xl shadow-amber-400/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Profile Header (Light Mode) */}
      <header className="relative bg-card rounded-2xl p-8 md:p-12 overflow-hidden shadow-2xl shadow-black/30 border border-white/8">
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
          {/* Avatar Block */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-orange-400 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
            <div
              className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/8 border-4 border-white/10 shadow-2xl relative flex items-center justify-center text-white/20 font-black text-6xl overflow-hidden cursor-pointer hover:border-amber-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {profile?.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile?.name || "User avatar"}
                  fill
                  className="object-cover group-hover:opacity-60 transition-opacity"
                />
              ) : (
                <span className="group-hover:opacity-40 transition-opacity">
                  {profile?.name?.charAt(0) || "U"}
                </span>
              )}

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Camera size={32} className="text-amber-400 drop-shadow-sm" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="absolute -bottom-2 md:-bottom-4 left-1/2 -translate-x-1/2 bg-background border border-white/10 text-white/60 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase shadow-xl whitespace-nowrap">
              {profile?.level || "NEWBIE"}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pt-4 w-full">
            <div className="flex items-center gap-3 mb-2 w-full justify-center md:justify-start">
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-tight">
                {profile?.name || "Anonymous User"}
              </h1>
            </div>

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

            {profile?.bio ? (
              <p className="text-white/50 font-medium leading-relaxed max-w-lg mb-8 text-sm md:text-base">
                {profile.bio}
              </p>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-white/50 font-medium text-sm mb-8 hover:text-amber-400/60 transition-colors italic"
              >
                + Add a bio…
              </button>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 w-full">
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-black px-6 py-3 rounded-2xl shadow-xl shadow-amber-400/20">
                <Zap size={18} fill="currentColor" />
                <span className="text-sm font-black uppercase tracking-widest">
                  {profile?.reputation || 0} Rep
                </span>
              </div>

              <Link
                href="/missions"
                className="flex items-center gap-2 bg-white/8 border border-white/10 px-6 py-3 rounded-2xl hover:border-amber-400 hover:bg-amber-400/5 transition-all"
              >
                <Target size={18} className="text-white/40" />
                <span className="text-sm font-bold uppercase tracking-widest text-foreground">
                  {missionStats?.completed || 0}/{missionStats?.total || 0}{" "}
                  Missions
                </span>
              </Link>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/8 text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all font-bold text-xs uppercase tracking-widest"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>

            {/* Contribution stats strip */}
            <div className="flex gap-2 mt-6 flex-wrap">
              {[
                {
                  label: "Scams",
                  count: scamsTotal,
                  tab: "scams",
                  color:
                    "text-red-400 bg-red-500/10 border-red-500/20 hover:border-red-500/40",
                },
                {
                  label: "Tips",
                  count: tipsTotal,
                  tab: "tips",
                  color:
                    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40",
                },
                {
                  label: "Prices",
                  count: reportsTotal,
                  tab: "reports",
                  color:
                    "text-amber-400 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40",
                },
                {
                  label: "Spots",
                  count: spotsTotal,
                  tab: "spots",
                  color:
                    "text-orange-400 bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40",
                },
              ].map(({ label, count, tab, color }) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex flex-col items-center px-4 py-2.5 rounded-2xl border transition-all",
                    color,
                  )}
                >
                  <span className="text-lg font-black leading-none">
                    {count}
                  </span>
                  <span className="text-[12x] font-bold uppercase tracking-widest opacity-70 mt-0.5">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Edit Button - Top Right */}
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-6 right-6 group bg-amber-400 text-black px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-300 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap z-20"
          >
            <Edit2 size={14} className="text-black" />
            <span className="hidden sm:inline">Edit</span>
            <span className="sm:hidden">Edit</span>
          </button>
        </div>
      </header>

      {/* 2. Contribution History Tabs */}
      <ProfileTabs
        userId="me"
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isPublic={false}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse h-screen bg-white/5 rounded-2xl m-4" />
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}
