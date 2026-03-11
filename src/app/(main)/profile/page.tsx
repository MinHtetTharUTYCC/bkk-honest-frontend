"use client";

import { useAuth } from "@/components/providers/auth-provider";
import {
  useProfile,
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
  ArrowRight,
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
import { useState, useEffect, useMemo, useRef } from "react";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { getSpotUrl, getScamAlertUrl } from "@/lib/slug";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab State maintained via URL
  const activeTab = (searchParams.get("tab") as "scams" | "reports" | "tips" | "spots") || "scams";

  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/profile?${params.toString()}`, { scroll: false });
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/dev-login");
    }
  }, [user, authLoading, router]);

  // Use 'me' for authenticated user data to leverage backend's current user context
  const { data: profileResponse, isLoading: profileLoading } = useProfile(
    user ? "me" : "",
  );
  const profile = profileResponse?.data || profileResponse;
  const { data: missionStats } = useMissionStats();

  const userId = user ? "me" : "";

  const {
    data: reportsData,
    fetchNextPage: fetchNextReports,
    hasNextPage: hasNextReports,
    isFetchingNextPage: isFetchingReports,
  } = useInfiniteUserPriceReports(userId);

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

  const { ref, inView } = useInView();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      await api.patch("/profiles/me", { name: editName, bio: editBio, country: editCountry });
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

  useEffect(() => {
    if (inView) {
      if (activeTab === "scams" && hasNextScams) fetchNextScams();
      if (activeTab === "tips" && hasNextTips) fetchNextTips();
      if (activeTab === "reports" && hasNextReports) fetchNextReports();
      if (activeTab === "spots" && hasNextSpots) fetchNextSpots();
    }
  }, [
    inView,
    activeTab,
    hasNextScams,
    hasNextTips,
    hasNextReports,
    hasNextSpots,
    fetchNextScams,
    fetchNextTips,
    fetchNextReports,
    fetchNextSpots,
  ]);

  const reportsList = useMemo(
    () => reportsData?.pages.flatMap((page) => page.data || []) || [],
    [reportsData],
  );
  const scamsList = useMemo(
    () => scamsData?.pages.flatMap((page) => page.data || []) || [],
    [scamsData],
  );
  const tipsList = useMemo(
    () => tipsData?.pages.flatMap((page) => page.data || []) || [],
    [tipsData],
  );
  const spotsList = useMemo(
    () => spotsData?.pages.flatMap((page) => page.data || []) || [],
    [spotsData],
  );

  const reportsTotal =
    reportsData?.pages[0]?.pagination?.total || reportsList.length;
  const scamsTotal = scamsData?.pages[0]?.pagination?.total || scamsList.length;
  const tipsTotal = tipsData?.pages[0]?.pagination?.total || tipsList.length;
  const spotsTotal = spotsData?.pages[0]?.pagination?.total || spotsList.length;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/dev-login");
  };

  if (authLoading || profileLoading) {
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center">
            <h3 className="font-display text-xl font-bold text-foreground tracking-tight mb-6">
              Confirm Avatar
            </h3>
            <div className="w-48 h-48 rounded-full border-4 border-amber-400/50 shadow-2xl shadow-amber-400/20 overflow-hidden mb-8">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
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
              <p className="mt-4 text-xs text-red-400 text-center font-medium">{uploadError}</p>
            )}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-white/8 relative">
            <button
              onClick={() => { setIsEditing(false); setSaveError(null); }}
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
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-lg font-bold text-foreground focus:outline-none focus:border-amber-400/50 focus:ring-4 focus:ring-amber-400/10 transition-all placeholder:text-white/20"
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                  Your Bio
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-medium text-white/70 focus:outline-none focus:border-amber-400/50 focus:ring-4 focus:ring-amber-400/10 transition-all placeholder:text-white/20 min-h-[120px] resize-none"
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
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-medium text-white/70 focus:outline-none focus:border-amber-400/50 focus:ring-4 focus:ring-amber-400/10 transition-all placeholder:text-white/20"
                  placeholder="e.g. Thailand, Japan, USA…"
                />
              </div>

              {saveError && (
                <p className="text-xs text-red-400 font-medium">{saveError}</p>
              )}

              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => { setIsEditing(false); setSaveError(null); }}
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
                <img
                  src={profile.avatarUrl}
                  className="w-full h-full object-cover group-hover:opacity-60 transition-opacity"
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

            <p
              className="text-white/40 font-medium uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-2 mb-4"
              suppressHydrationWarning
            >
              <Calendar size={14} className="text-white/20" />
              Joined{" "}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString()
                : "Mar 2026"}
            </p>

            {profile?.country && (
              <p className="text-white/40 font-medium uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-2 mb-4">
                <MapPin size={12} className="text-white/20" />
                {profile.country}
              </p>
            )}

            {profile?.bio ? (
              <p className="text-white/50 font-medium leading-relaxed max-w-lg mb-8 text-sm md:text-base">
                {profile.bio}
              </p>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-white/25 font-medium text-sm mb-8 hover:text-amber-400/60 transition-colors italic"
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

              <div className="flex items-center gap-2 bg-white/8 border border-white/10 px-6 py-3 rounded-2xl">
                <Target size={18} className="text-white/40" />
                <span className="text-sm font-bold uppercase tracking-widest text-foreground">
                  {missionStats?.completed || 0}/{missionStats?.total || 0} Missions
                </span>
              </div>

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
                { label: 'Scams', count: scamsTotal, tab: 'scams', color: 'text-red-400 bg-red-500/10 border-red-500/20 hover:border-red-500/40' },
                { label: 'Tips', count: tipsTotal, tab: 'tips', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40' },
                { label: 'Prices', count: reportsTotal, tab: 'reports', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40' },
                { label: 'Spots', count: spotsTotal, tab: 'spots', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40' },
              ].map(({ label, count, tab, color }) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn("flex flex-col items-center px-4 py-2.5 rounded-2xl border transition-all", color)}
                >
                  <span className="text-lg font-black leading-none">{count}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-70 mt-0.5">{label}</span>
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
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
          <h2 className="font-display text-3xl font-bold text-foreground tracking-tight">
            My Pulse
          </h2>

          <div className="flex bg-white/8 p-1 rounded-2xl md:p-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("scams")}
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === "scams"
                  ? "bg-red-500/20 text-red-400 shadow-sm"
                  : "text-white/40 hover:text-white/70",
              )}
            >
              <span className="hidden md:inline">Scam Alerts</span>
              <span className="md:hidden">Scams</span> ({scamsTotal})
            </button>
            <button
              onClick={() => setActiveTab("tips")}
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === "tips"
                  ? "bg-emerald-400/15 text-emerald-400 shadow-sm"
                  : "text-white/40 hover:text-white/70",
              )}
            >
              Tips ({tipsTotal})
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === "reports"
                  ? "bg-amber-400/15 text-amber-400 shadow-sm"
                  : "text-white/40 hover:text-white/70",
              )}
            >
              <span className="hidden md:inline">Price Reports</span>
              <span className="md:hidden">Prices</span> ({reportsTotal})
            </button>
            <button
              onClick={() => setActiveTab("spots")}
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === "spots"
                  ? "bg-orange-400/15 text-orange-400 shadow-sm"
                  : "text-white/40 hover:text-white/70",
              )}
            >
              Spots ({spotsTotal})
            </button>
          </div>
        </header>

        <div className="space-y-6">
          {activeTab === "scams" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {!scamsData ? (
                // Loading skeleton
                [1, 2].map(i => (
                  <div key={i} className="bg-card rounded-2xl p-6 border border-white/8 h-40 animate-pulse" />
                ))
              ) : scamsList.length > 0 ? (
                scamsList.map((scam: any) => (
                  <div
                    key={scam.id}
                    className="bg-card rounded-2xl p-6 md:p-8 border border-white/8 shadow-xl shadow-black/20 border-l-4 border-l-red-500 overflow-hidden flex flex-row items-stretch gap-6"
                  >
                    {scam.imageUrl && (
                      <div className="w-32 md:w-48 rounded-xl bg-white/5 overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={scam.imageUrl}
                          alt={scam.scamName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-medium text-white/20 uppercase tracking-tighter">
                          {new Date(scam.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-display text-xl font-bold text-foreground mb-2 tracking-tight">
                        {scam.scamName}
                      </h4>
                      <p className="text-xs font-medium text-white/50 line-clamp-2 mb-6 leading-relaxed">
                        {scam.description}
                      </p>
                      <Link
                        href={getScamAlertUrl(scam?.city?.name || 'Bangkok', scam?.scamName || '')}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors mt-auto pt-4"
                      >
                        View Details
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center gap-4">
                  <p className="text-[10px] font-medium text-white/20 uppercase tracking-widest">
                    No scam alerts reported yet
                  </p>
                  <Link href="/report" className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest flex items-center gap-1">
                    Report a Scam <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "tips" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {!tipsData ? (
                [1, 2].map(i => (
                  <div key={i} className="bg-card rounded-2xl p-6 border border-white/8 h-40 animate-pulse" />
                ))
              ) : tipsList.length > 0 ? (
                tipsList.map((tip: any) => (
                  <div
                    key={tip.id}
                    className="bg-card rounded-2xl p-8 border border-white/8 shadow-xl shadow-black/20 border-l-4 border-l-emerald-400 overflow-hidden flex flex-col"
                  >
                    {tip.imageUrl && (
                      <div className="w-full h-48 mb-6 rounded-xl bg-white/5 overflow-hidden shrink-0">
                        <img
                          src={tip.imageUrl}
                          alt={tip.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] font-medium text-white/20 uppercase tracking-tighter">
                        {new Date(tip.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-display text-xl font-bold text-foreground mb-2 tracking-tight">
                      {tip.title}
                    </h4>
                    <p className="text-xs font-medium text-white/50 line-clamp-2 mb-6 leading-relaxed">
                      {tip.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest flex items-center gap-1">
                        <MapPin size={10} /> {tip.spot?.name}
                      </span>
                      <Link
                        href={getSpotUrl(tip.spot?.city?.name || 'Bangkok', tip.spot?.name || '')}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        View Spot
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <p className="text-[10px] font-medium text-white/20 uppercase tracking-widest">
                    No community tips shared yet
                  </p>
                  <Link href="/report" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest flex items-center gap-1">
                    Share a Tip <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {!reportsData ? (
                [1, 2].map(i => (
                  <div key={i} className="bg-card rounded-2xl p-6 border border-white/8 h-40 animate-pulse" />
                ))
              ) : reportsList.length > 0 ? (
                reportsList.map((report: any) => (
                  <div
                    key={report.id}
                    className="bg-card rounded-2xl p-8 border border-white/8 shadow-xl shadow-black/20 border-l-4 border-l-amber-400 overflow-hidden flex flex-col"
                  >
                    {report.imageUrl && (
                      <div className="w-full h-48 mb-6 rounded-xl bg-white/5 overflow-hidden shrink-0">
                        <img
                          src={report.imageUrl}
                          alt={report.itemName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] font-medium text-white/20 uppercase tracking-tighter">
                        {new Date(report.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-display text-xl font-bold text-foreground mb-2 tracking-tight">
                      {report.itemName}
                    </h4>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="font-display text-2xl font-bold text-amber-400 tracking-tight">
                        {report.priceThb} THB
                      </span>
                      <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                        @ {report.spot?.name || "Local Spot"}
                      </span>
                    </div>
                    <Link
                      href={`/spots/${report.spotId}`}
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      View Spot
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center gap-4">
                  <p className="text-[10px] font-medium text-white/20 uppercase tracking-widest">
                    No price reports shared yet
                  </p>
                  <Link href="/report" className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-widest flex items-center gap-1">
                    Report a Price <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "spots" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {!spotsData ? (
                [1, 2].map(i => (
                  <div key={i} className="bg-card rounded-2xl p-6 border border-white/8 h-40 animate-pulse" />
                ))
              ) : spotsList.length > 0 ? (
                spotsList.map((spot: any) => (
                  <div
                    key={spot.id}
                    className="bg-card rounded-2xl p-6 md:p-8 border border-white/8 shadow-xl shadow-black/20 border-l-4 border-l-orange-400 overflow-hidden flex flex-row items-stretch gap-6"
                  >
                    {spot.imageUrl && (
                      <div className="w-32 md:w-48 rounded-xl bg-white/5 overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={spot.imageUrl}
                          alt={spot.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-medium text-white/20 uppercase tracking-tighter">
                          {new Date(spot.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-display text-xl font-bold text-foreground mb-2 tracking-tight">
                        {spot.name}
                      </h4>
                      <p className="text-xs font-medium text-white/50 line-clamp-1 mb-6 leading-relaxed flex items-center gap-1">
                        <MapPin size={10} className="text-orange-400" />{" "}
                        {spot.address}
                      </p>
                      <Link
                        href={getSpotUrl(spot?.city?.name || 'Bangkok', spot?.name || '')}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors mt-auto pt-4"
                      >
                        View Spot Details
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center gap-4">
                  <p className="text-[10px] font-medium text-white/20 uppercase tracking-widest">
                    No spots added yet
                  </p>
                  <Link href="/report" className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors uppercase tracking-widest flex items-center gap-1">
                    Add a Spot <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          <div ref={ref} className="py-10 flex justify-center">
            {(isFetchingScams ||
              isFetchingTips ||
              isFetchingReports ||
              isFetchingSpots) && (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">
                  Syncing more pulse...
                </span>
              </div>
            )}
            {!hasNextScams && activeTab === "scams" && scamsList.length > 0 && (
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/20">
                End of scams pulse
              </p>
            )}
            {!hasNextTips && activeTab === "tips" && tipsList.length > 0 && (
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/20">
                End of tips pulse
              </p>
            )}
            {!hasNextReports &&
              activeTab === "reports" &&
              reportsList.length > 0 && (
                <p className="text-[10px] font-medium uppercase tracking-widest text-white/20">
                  End of price pulse
                </p>
              )}
            {!hasNextSpots && activeTab === "spots" && spotsList.length > 0 && (
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/20">
                End of spots pulse
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
