"use client";

import { useAuth } from "@/components/providers/auth-provider";
import {
  useProfile,
  useInfiniteUserPriceReports,
  useInfiniteUserScamAlerts,
  useInfiniteUserCommunityTips,
  useInfiniteUserSpots,
} from "@/hooks/use-api";
import {
  Zap,
  Shield,
  MapPin,
  DollarSign,
  Calendar,
  LogOut,
  ArrowRight,
  User as UserIcon,
  MessageSquare,
  Loader2,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();

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

  const [activeTab, setActiveTab] = useState<
    "scams" | "reports" | "tips" | "spots"
  >("scams");

  const { ref, inView } = useInView();

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
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* 1. Profile Header */}
      <header className="bg-white p-12 rounded-[40px] border border-gray-300 shadow-2xl shadow-gray-200/40 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/5 rounded-full -mr-32 -mt-32 blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="w-32 h-32 rounded-[40px] bg-cyan-400 flex items-center justify-center text-white font-black text-4xl shadow-xl shadow-cyan-400/30">
            {profile?.name?.charAt(0) || "U"}
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
                  {profile?.name || "Anonymous User"}
                </h1>
                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-emerald-100">
                  {profile?.level || "NEWBIE"}
                </div>
              </div>
              <p
                className="text-gray-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center md:justify-start gap-2"
                suppressHydrationWarning
              >
                <Calendar size={14} className="text-cyan-400" />
                Joined{" "}
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "Mar 2026"}
              </p>
            </div>

            <p className="text-gray-600 font-medium leading-relaxed max-w-lg">
              {profile?.bio ||
                "Helping locals and tourists navigate Bangkok with honesty and transparency."}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-gray-900/10 transition-transform active:scale-95 cursor-default">
                <Zap size={16} fill="currentColor" className="text-cyan-400" />
                <span className="text-xs font-black uppercase tracking-widest">
                  {profile?.reputation || 0} Rep ⚡
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-400 hover:text-red-500 font-black text-xs uppercase tracking-widest transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
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
                    className="bg-white rounded-[40px] p-6 md:p-8 border border-gray-300 shadow-xl shadow-gray-200/20 border-l-8 border-l-red-500 overflow-hidden flex flex-row items-stretch gap-6"
                  >
                    {scam.imageUrl && (
                      <div className="w-32 md:w-48 rounded-[20px] bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
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
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-500 transition-colors mt-auto pt-4"
                      >
                        View Details
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-300">
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
                    className="bg-white rounded-[40px] p-8 border border-gray-300 shadow-xl shadow-gray-200/20 border-l-8 border-l-emerald-500 overflow-hidden flex flex-col"
                  >
                    {tip.imageUrl && (
                      <div className="w-full h-48 mb-6 rounded-[20px] bg-gray-100 overflow-hidden shrink-0">
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
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-500 transition-colors"
                      >
                        View Spot
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-300">
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
                    className="bg-white rounded-[40px] p-8 border border-gray-300 shadow-xl shadow-gray-200/20 border-l-8 border-l-cyan-400 overflow-hidden flex flex-col"
                  >
                    {report.imageUrl && (
                      <div className="w-full h-48 mb-6 rounded-[20px] bg-gray-100 overflow-hidden shrink-0">
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
                      <span className="text-2xl font-black text-cyan-400 tracking-tighter italic">
                        {report.priceThb} THB
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        @ {report.spot?.name || "Local Spot"}
                      </span>
                    </div>
                    <Link
                      href={`/spots/${report.spotId}`}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-500 transition-colors"
                    >
                      View Spot
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-300">
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
                    className="bg-white rounded-[40px] p-6 md:p-8 border border-gray-300 shadow-xl shadow-gray-200/20 border-l-8 border-l-orange-500 overflow-hidden flex flex-row items-stretch gap-6"
                  >
                    {spot.imageUrl && (
                      <div className="w-32 md:w-48 rounded-[20px] bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
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
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-500 transition-colors mt-auto pt-4"
                      >
                        View Spot Details
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-300">
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
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
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
