'use client';

import { AlertTriangle, TrendingUp, Calendar, User, Info, CheckCircle2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoteToggle } from '@/hooks/use-vote-toggle';

interface ScamAlertCardProps {
  alert: any;
}

export default function ScamAlertCard({ alert }: ScamAlertCardProps) {
  const { toggleVote, isPending } = useVoteToggle('alert');

  return (
    <div className="bg-white rounded-[40px] border-2 border-gray-300 shadow-xl shadow-gray-200/20 overflow-hidden group hover:shadow-2xl hover:shadow-gray-200/40 transition-all duration-500">
      {alert.imageUrl && (
        <div className="relative h-56 overflow-hidden">
          <img 
            src={alert.imageUrl} 
            alt={alert.scamName} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
          <div className="absolute top-6 left-6">
            <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg shadow-red-500/20 flex items-center gap-2">
              <AlertTriangle size={12} />
              High Alert
            </span>
          </div>
        </div>
      )}
      
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
              {alert.category?.name}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Calendar size={10} />
              {new Date(alert.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic group-hover:text-red-500 transition-colors">
            {alert.scamName}
          </h3>
        </div>

        <div className="space-y-4">
          <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100/50">
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
              <Info size={12} />
              The Scam
            </span>
            <p className="text-xs font-medium text-gray-600 leading-relaxed">
              {alert.description}
            </p>
          </div>

          <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100/50">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
              <CheckCircle2 size={12} />
              How to Avoid
            </span>
            <p className="text-xs font-medium text-gray-600 leading-relaxed italic">
              {alert.preventionTip}
            </p>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-gray-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
               <User size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{alert.user?.name || 'Local Expert'}</span>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Level {alert.user?.level || '1'}</span>
            </div>
          </div>

          <div className="flex bg-gray-50 p-1 rounded-[20px] border border-gray-300">
            <button 
              onClick={() => toggleVote(alert)}
              disabled={isPending}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all",
                alert.hasVoted 
                  ? "bg-white text-red-500 shadow-lg shadow-red-500/10" 
                  : "text-gray-400 hover:text-red-500"
              )}
            >
              <Heart size={16} fill={alert.hasVoted ? "currentColor" : "none"} />
              {alert._count?.votes || 0}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
