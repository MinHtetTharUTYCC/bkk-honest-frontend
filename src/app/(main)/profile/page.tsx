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
  const [isSaving, setIsSaving] = useState(false);

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize edit state when profile loads
  useEffect(() => {
    if (profile) {
      setEditName(profile.name || "");
      setEditBio(profile.bio || "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await api.patch("/profiles/me", { name: editName, bio: editBio });
      await queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
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
      alert("Failed to upload avatar");
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
        <div className="h-64 bg-gray-100 rounded-[40px]" />
        <div className="h-96 bg-gray-100 rounded-[40px]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 px-4 sm:px-0">
      {/* Avatar Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center">
            <h3 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter mb-6">
              Confirm Avatar
            </h3>
            <div className="w-48 h-48 rounded-full border-4 border-cyan-400/50 shadow-2xl shadow-cyan-400/20 overflow-hidden mb-8">
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
                }}
                disabled={isUploading}
                className="flex-1 py-3 px-4 rounded-2xl bg-gray-100 text-gray-400 font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadAvatar}
                disabled={isUploading}
                className="flex-1 py-3 px-4 rounded-2xl bg-cyan-500 text-white font-black uppercase tracking-widest text-xs hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Looks Good"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>

            <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter mb-8">
              Edit Profile
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-lg font-bold text-gray-900 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 transition-all placeholder:text-gray-300"
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-sm font-medium text-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 transition-all placeholder:text-gray-300 min-h-[120px] resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="flex-1 py-4 px-6 rounded-2xl bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 py-4 px-6 rounded-2xl bg-cyan-500 text-white font-black uppercase tracking-widest text-xs hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
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
      <header className="relative bg-white rounded-[40px] p-8 md:p-12 overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-100">
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
          {/* Avatar Block */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-emerald-400 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
            <div
              className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white border-4 border-gray-50 shadow-2xl relative flex items-center justify-center text-gray-300 font-black text-6xl shadow-gray-200 overflow-hidden cursor-pointer hover:border-cyan-400 transition-colors"
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
                <Camera size={32} className="text-cyan-500 drop-shadow-sm" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="absolute -bottom-2 md:-bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black tracking-widest uppercase shadow-xl whitespace-nowrap">
              {profile?.level || "NEWBIE"}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pt-4 w-full">
            <div className="flex items-center gap-3 mb-2 w-full justify-center md:justify-start">
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase italic drop-shadow-sm">
                {profile?.name || "Anonymous User"}
              </h1>
            </div>

            <p
              className="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-2 mb-4"
              suppressHydrationWarning
            >
              <MapPin size={14} className="text-gray-300" />
              From USA
              <span className="text-gray-200 mx-1">•</span>
              <Calendar size={14} className="text-gray-300" />
              Joined{" "}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString()
                : "Mar 2026"}
            </p>

            <p className="text-gray-500 font-medium leading-relaxed max-w-lg mb-8 text-sm md:text-base">
              {profile?.bio ||
                "Exploring Bangkok with honesty and sharing real experiences from the streets."}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 w-full">
              <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-cyan-400/20">
                <Zap size={18} fill="currentColor" />
                <span className="text-sm font-black uppercase tracking-widest">
                  {profile?.reputation || 0} Rep
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-2xl shadow-xl shadow-gray-200/20">
                <Target size={18} className="text-gray-400" />
                <span className="text-sm font-black uppercase tracking-widest text-gray-900">
                  {missionStats?.completed || 0}/{missionStats?.total || 0} Missions
                </span>
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all font-black text-xs uppercase tracking-widest"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Edit Button - Top Right */}
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-6 right-6 group bg-gray-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap z-20"
          >
            <Edit2 size={14} className="text-cyan-400 group-hover:text-white transition-colors" />
            <span className="hidden sm:inline">Edit</span>
            <span className="sm:hidden">Edit</span>
          </button>
        </div>
      </header>

      {/* 2. Contribution History Tabs */}
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">
            My Pulse
          </h2>

          <div className="flex bg-gray-100 p-1 rounded-2xl md:p-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("scams")}
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === "scams"
                  ? "bg-white text-red-500 shadow-sm"
                  : "text-gray-400 hover:text-gray-600",
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
                  ? "bg-white text-emerald-500 shadow-sm"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              Tips ({tipsTotal})
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === "reports"
                  ? "bg-white text-cyan-400 shadow-sm"
                  : "text-gray-400 hover:text-gray-600",
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
                  ? "bg-white text-orange-500 shadow-sm"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              Spots ({spotsTotal})
            </button>
          </div>
        </header>

        <div className="space-y-6">
          {activeTab === "scams" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {scamsList.length > 0 ? (
                scamsList.map((scam: any) => (
                  <div
                    key={scam.id}
                    className="bg-white rounded-[40px] p-6 md:p-8 border border-gray-200 shadow-xl shadow-gray-100/50 border-l-8 border-l-red-500 overflow-hidden flex flex-row items-stretch gap-6"
                  >
                    {scam.imageUrl && (
                      <div className="w-32 md:w-48 rounded-[20px] bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={scam.imageUrl}
                          alt={scam.scamName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter italic">
                          {new Date(scam.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-gray-900 mb-2 italic tracking-tight">
                        {scam.scamName}
                      </h4>
                      <p className="text-xs font-medium text-gray-600 line-clamp-2 mb-6 leading-relaxed">
                        {scam.description}
                      </p>
                      <Link
                        href={`/scam-alerts/${scam.id}`}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-500 hover:text-cyan-600 transition-colors mt-auto pt-4"
                      >
                        View Details
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
                    No scam alerts reported yet
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "tips" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tipsList.length > 0 ? (
                tipsList.map((tip: any) => (
                  <div
                    key={tip.id}
                    className="bg-white rounded-[40px] p-8 border border-gray-200 shadow-xl shadow-gray-100/50 border-l-8 border-l-emerald-500 overflow-hidden flex flex-col"
                  >
                    {tip.imageUrl && (
                      <div className="w-full h-48 mb-6 rounded-[20px] bg-gray-50 overflow-hidden shrink-0">
                        <img
                          src={tip.imageUrl}
                          alt={tip.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter italic">
                        {new Date(tip.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-gray-900 mb-2 italic tracking-tight">
                      {tip.title}
                    </h4>
                    <p className="text-xs font-medium text-gray-600 line-clamp-2 mb-6 leading-relaxed">
                      {tip.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <MapPin size={10} /> {tip.spot?.name}
                      </span>
                      <Link
                        href={`/spots/${tip.spot?.id}`}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-500 hover:text-cyan-600 transition-colors"
                      >
                        View Spot
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
                    No community tips shared yet
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reportsList.length > 0 ? (
                reportsList.map((report: any) => (
                  <div
                    key={report.id}
                    className="bg-white rounded-[40px] p-8 border border-gray-200 shadow-xl shadow-gray-100/50 border-l-8 border-l-cyan-400 overflow-hidden flex flex-col"
                  >
                    {report.imageUrl && (
                      <div className="w-full h-48 mb-6 rounded-[20px] bg-gray-50 overflow-hidden shrink-0">
                        <img
                          src={report.imageUrl}
                          alt={report.itemName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter italic">
                        {new Date(report.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-gray-900 mb-2 italic tracking-tight">
                      {report.itemName}
                    </h4>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-2xl font-black text-cyan-500 tracking-tighter italic">
                        {report.priceThb} THB
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        @ {report.spot?.name || "Local Spot"}
                      </span>
                    </div>
                    <Link
                      href={`/spots/${report.spotId}`}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-500 hover:text-cyan-600 transition-colors"
                    >
                      View Spot
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
                    No price reports shared yet
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "spots" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {spotsList.length > 0 ? (
                spotsList.map((spot: any) => (
                  <div
                    key={spot.id}
                    className="bg-white rounded-[40px] p-6 md:p-8 border border-gray-200 shadow-xl shadow-gray-100/50 border-l-8 border-l-orange-500 overflow-hidden flex flex-row items-stretch gap-6"
                  >
                    {spot.imageUrl && (
                      <div className="w-32 md:w-48 rounded-[20px] bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={spot.imageUrl}
                          alt={spot.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter italic">
                          {new Date(spot.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-gray-900 mb-2 italic tracking-tight">
                        {spot.name}
                      </h4>
                      <p className="text-xs font-medium text-gray-600 line-clamp-1 mb-6 leading-relaxed flex items-center gap-1">
                        <MapPin size={10} className="text-orange-500" />{" "}
                        {spot.address}
                      </p>
                      <Link
                        href={`/spots/${spot.id}`}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-500 hover:text-cyan-600 transition-colors mt-auto pt-4"
                      >
                        View Spot Details
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
                    No spots added yet
                  </p>
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
                <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                  Syncing more pulse...
                </span>
              </div>
            )}
            {!hasNextScams && activeTab === "scams" && scamsList.length > 0 && (
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">
                End of scams pulse
              </p>
            )}
            {!hasNextTips && activeTab === "tips" && tipsList.length > 0 && (
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">
                End of tips pulse
              </p>
            )}
            {!hasNextReports &&
              activeTab === "reports" &&
              reportsList.length > 0 && (
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">
                  End of price pulse
                </p>
              )}
            {!hasNextSpots && activeTab === "spots" && spotsList.length > 0 && (
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">
                End of spots pulse
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
