'use client';

import { AlertTriangle, Calendar, User, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoteToggle } from '@/hooks/use-vote-toggle';

interface ScamAlertCardProps {
  alert: any;
}

export default function ScamAlertCard({ alert }: ScamAlertCardProps) {
  const { toggleVote, isPending } = useVoteToggle('alert');

  return (
    <div className="bg-white rounded-[28px] border border-gray-200 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-row">
      {/* Photo — left */}
      {alert.imageUrl && (
        <div className="relative w-36 shrink-0 overflow-hidden">
          <img
            src={alert.imageUrl}
            alt={alert.scamName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Category pill moved into image */}
          <div className="absolute top-3 left-3">
            <span className="bg-red-500/90 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase flex items-center gap-1 shadow-lg">
              <AlertTriangle size={8} />
              {alert.category?.name || 'Scam'}
            </span>
          </div>
        </div>
      )}

      {/* Content — right */}
      <div className="flex-1 p-5 flex flex-col gap-3 min-w-0">
        {/* Meta row - User at top left, Date at top right */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              <User size={10} />
            </div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">
              {alert.user?.name || 'Local Expert'}
            </span>
          </div>
          
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <Calendar size={10} />
            {new Date(alert.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase italic group-hover:text-red-500 transition-colors leading-tight">
          {alert.scamName}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 font-medium leading-relaxed line-clamp-2">
          {alert.description}
        </p>

        {/* Prevention tip */}
        {alert.preventionTip && (
          <p className="text-sm text-emerald-600 font-semibold leading-relaxed line-clamp-2 italic">
            <span className="not-italic mr-1">💡</span>
            {alert.preventionTip}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-end pt-2 border-t border-gray-100">
          <button
            onClick={() => toggleVote(alert)}
            disabled={isPending}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border",
              alert.hasVoted
                ? "bg-red-50 border-red-200 text-red-500"
                : "border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200"
            )}
          >
            <Heart size={12} fill={alert.hasVoted ? "currentColor" : "none"} />
            {alert._count?.votes || 0}
          </button>
        </div>
      </div>
    </div>
  );
}
