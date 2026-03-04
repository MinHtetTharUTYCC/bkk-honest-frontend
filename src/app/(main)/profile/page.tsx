'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useProfile, useUserPriceReports, useUserScamAlerts, useUserCommunityTips } from '@/hooks/use-api';
import { Zap, Shield, MapPin, DollarSign, Calendar, LogOut, ArrowRight, User as UserIcon, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/dev-login');
    }
  }, [user, authLoading, router]);

  // Use 'me' for authenticated user data to leverage backend's current user context
  const { data: profileResponse, isLoading: profileLoading } = useProfile(user ? 'me' : '');
  const profile = profileResponse?.data || profileResponse;
  
  const { data: reports } = useUserPriceReports(user ? 'me' : '');
  const { data: scams } = useUserScamAlerts(user ? 'me' : '');
  const { data: tips } = useUserCommunityTips(user ? 'me' : '');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/dev-login');
  };

  const [activeTab, setActiveTab] = useState<'scams' | 'reports' | 'tips'>('scams');

  if (authLoading || profileLoading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="h-64 bg-gray-100 rounded-[40px]" />
        <div className="h-96 bg-gray-100 rounded-[40px]" />
      </div>
    );
  }

  const reportsList = reports?.data || reports || [];
  const scamsList = scams?.data || scams || [];
  const tipsList = tips?.data || tips || [];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* 1. Profile Header */}
      <header className="bg-white p-12 rounded-[40px] border border-gray-300 shadow-2xl shadow-gray-200/40 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="w-32 h-32 rounded-[40px] bg-cyan-400 flex items-center justify-center text-white font-black text-4xl shadow-xl shadow-cyan-400/30">
            {profile?.name?.charAt(0) || 'U'}
          </div>
          
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">{profile?.name || 'Anonymous User'}</h1>
                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-emerald-100">
                  {profile?.level || 'NEWBIE'}
                </div>
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center md:justify-start gap-2" suppressHydrationWarning>
                <Calendar size={14} className="text-cyan-400" />
                Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Mar 2026'}
              </p>
            </div>
            
            <p className="text-gray-600 font-medium leading-relaxed max-w-lg">
              {profile?.bio || 'Helping locals and tourists navigate Bangkok with honesty and transparency.'}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-gray-900/10 transition-transform active:scale-95 cursor-default">
                <Zap size={16} fill="currentColor" className="text-cyan-400" />
                <span className="text-xs font-black uppercase tracking-widest">{profile?.reputation || 0} Rep ⚡</span>
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

      {/* 2. Impact Summary */}
      <div className="grid grid-cols-3 gap-4 md:gap-8 px-2 md:px-0">
        <div className="bg-white p-4 md:p-8 rounded-[30px] md:rounded-[40px] border border-gray-300 shadow-xl shadow-gray-200/20 text-center space-y-1 md:space-y-2 group hover:bg-cyan-400/5 transition-colors">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-cyan-100 text-cyan-400 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-4 transition-transform group-hover:scale-110">
            <DollarSign size={16} className="md:w-6 md:h-6" />
          </div>
          <div className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter italic">{reportsList.length}</div>
          <div className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Prices</div>
        </div>
        <div className="bg-white p-4 md:p-8 rounded-[30px] md:rounded-[40px] border border-gray-300 shadow-xl shadow-gray-200/20 text-center space-y-1 md:space-y-2 group hover:bg-red-400/5 transition-colors">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-red-100 text-red-500 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-4 transition-transform group-hover:scale-110">
            <Shield size={16} className="md:w-6 md:h-6" />
          </div>
          <div className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter italic">{scamsList.length}</div>
          <div className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Scams</div>
        </div>
        <div className="bg-white p-4 md:p-8 rounded-[30px] md:rounded-[40px] border border-gray-300 shadow-xl shadow-gray-200/20 text-center space-y-1 md:space-y-2 group hover:bg-emerald-400/5 transition-colors">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-emerald-100 text-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-4 transition-transform group-hover:scale-110">
            <Zap size={16} className="md:w-6 md:h-6" />
          </div>
          <div className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter italic">98%</div>
          <div className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Trust</div>
        </div>
      </div>

      {/* 3. Contribution History Tabs */}
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">My Pulse</h2>
          
          <div className="flex bg-gray-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('scams')}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'scams' ? "bg-white text-red-500 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Scam Alerts ({scamsList.length})
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'tips' ? "bg-white text-emerald-500 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Tips ({tipsList.length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'reports' ? "bg-white text-cyan-400 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Price Reports ({reportsList.length})
            </button>
          </div>
        </header>

        <div className="space-y-6">
          {activeTab === 'scams' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {scamsList.length > 0 ? (
                scamsList.map((scam: any) => (
                  <div key={scam.id} className="bg-white rounded-[40px] p-8 border border-gray-300 shadow-xl shadow-gray-200/20 border-l-8 border-l-red-500">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">Scam Alert</span>
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter italic">{new Date(scam.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-xl font-black text-gray-900 mb-2 italic tracking-tight">{scam.scamName}</h4>
                    <p className="text-xs font-medium text-gray-600 line-clamp-2 mb-6 leading-relaxed">{scam.description}</p>
                    <Link href={`/scam-alerts/${scam.id}`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-500 transition-colors">
                      View Details
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-300">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">No scam alerts reported yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tipsList.length > 0 ? (
                tipsList.map((tip: any) => (
                  <div key={tip.id} className="bg-white rounded-[40px] p-8 border border-gray-300 shadow-xl shadow-gray-200/20 border-l-8 border-l-emerald-500">
                    <div className="flex items-center justify-between mb-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase",
                        tip.type === 'TRY' ? "bg-emerald-50 text-emerald-500" : "bg-orange-50 text-orange-500"
                      )}>
                        {tip.type} TIP
                      </span>
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter italic">{new Date(tip.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-xl font-black text-gray-900 mb-2 italic tracking-tight">{tip.title}</h4>
                    <p className="text-xs font-medium text-gray-600 line-clamp-2 mb-6 leading-relaxed">{tip.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <MapPin size={10} /> {tip.spot?.name}
                      </span>
                      <Link href={`/spots/${tip.spot?.id}`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-500 transition-colors">
                        View Spot
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-300">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">No community tips shared yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reportsList.length > 0 ? (
                reportsList.map((report: any) => (
                  <div key={report.id} className="bg-white rounded-[40px] p-8 border border-gray-300 shadow-xl shadow-gray-200/20 border-l-8 border-l-cyan-400">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-cyan-50 text-cyan-500 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">Price Report</span>
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter italic">{new Date(report.timestamp).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-xl font-black text-gray-900 mb-2 italic tracking-tight">{report.itemName}</h4>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-2xl font-black text-cyan-400 tracking-tighter italic">{report.priceThb} THB</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">@ {report.spot?.name || 'Local Spot'}</span>
                    </div>
                    <Link href={`/spots/${report.spotId}`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-500 transition-colors">
                      View Spot
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-300">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">No price reports shared yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
