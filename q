[1mdiff --git a/src/components/spots/spot-header.tsx b/src/components/spots/spot-header.tsx[m
[1mindex fd7b28d..76bc0f5 100644[m
[1m--- a/src/components/spots/spot-header.tsx[m
[1m+++ b/src/components/spots/spot-header.tsx[m
[36m@@ -1,6 +1,7 @@[m
 "use client";[m
 [m
[31m-import { MapPin, Zap, CheckCircle2, Target, Navigation, ImageIcon, Share2, Edit2, Trash2, Flag, Loader2, ArrowLeft, MoreVertical } from "lucide-react";[m
[32m+[m[32mimport { useState } from "react";[m
[32m+[m[32mimport { MapPin, Zap, CheckCircle2, Target, Navigation, ImageIcon, Share2, Edit2, Trash2, Flag, Loader2, ArrowLeft, MoreVertical, X } from "lucide-react";[m
 import Link from "next/link";[m
 import { useRouter } from "next/navigation";[m
 import { cn } from "@/lib/utils";[m
[36m@@ -12,6 +13,8 @@[m [mimport { useAuth } from "@/components/providers/auth-provider";[m
 import { toast } from "sonner";[m
 import { useAddMission, useMissions } from "@/hooks/use-api";[m
 import { useVoteToggle } from "@/hooks/use-vote-toggle";[m
[32m+[m[32mimport SpotStatsGrid from "@/components/spots/spot-stats-grid";[m
[32m+[m[32mimport { TruncatedTextWithDialog } from "@/components/ui/truncated-text-with-dialog";[m
 [m
 interface SpotHeaderProps {[m
   spot: SpotData;[m
[36m@@ -71,7 +74,8 @@[m [mexport default function SpotHeader({ spot, onEdit, onDelete, onImageClick }: Spo[m
   };[m
 [m
   return ([m
[31m-    <header className="space-y-6">[m
[32m+[m[32m    <>[m
[32m+[m[32m      <header className="space-y-6">[m
       <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-white/50 hover:text-amber-400 transition-colors">[m
         <ArrowLeft size={14} strokeWidth={3} /> Back[m
       </button>[m
[36m@@ -119,10 +123,17 @@[m [mexport default function SpotHeader({ spot, onEdit, onDelete, onImageClick }: Spo[m
 [m
           <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-between gap-6 md:hidden">[m
             <div className="space-y-3">[m
[31m-              <h1 className="text-4xl font-display font-bold text-white tracking-tight drop-shadow-sm line-clamp-2 break-words">{spot.name}</h1>[m
[31m-              <div className="space-y-1">[m
[31m-                <p className="text-white/60 font-bold uppercase tracking-widest text-xs flex items-center gap-2"><MapPin size={14} strokeWidth={3} className="text-amber-400 shrink-0" /><span className="truncate">{spot.address}</span></p>[m
[31m-              </div>[m
[32m+[m[32m              <TruncatedTextWithDialog[m
[32m+[m[32m                text={spot.name}[m
[32m+[m[32m                textClassName="text-2xl font-display font-bold text-white tracking-tight drop-shadow-sm"[m
[32m+[m[32m              />[m
[32m+[m[32m              <TruncatedTextWithDialog[m
[32m+[m[32m                text={spot.address}[m
[32m+[m[32m                title="Full Address"[m
[32m+[m[32m                icon={<MapPin size={14} strokeWidth={3} className="text-amber-400 mt-0.5" />}[m
[32m+[m[32m                textClassName="text-white/60 font-bold uppercase tracking-widest text-xs leading-tight"[m
[32m+[m[32m                className="mt-1"[m
[32m+[m[32m              />[m
             </div>[m
             <div className="flex w-full items-center justify-between gap-3" onClick={(e) => e.stopPropagation()}>[m
               <button onClick={handleAcceptMission} disabled={addMission.isPending || isInMissions} className={cn("flex-1 bg-white/10 backdrop-blur-md text-white px-4 py-4 rounded-2xl transition-all active:scale-95 border shadow-xl flex items-center justify-center gap-2 text-[10px] font-semibold tracking-wide", isInMissions ? "bg-emerald-500/80 border-emerald-400 text-white" : "hover:bg-amber-400 border-white/20")}>[m
[36m@@ -137,108 +148,101 @@[m [mexport default function SpotHeader({ spot, onEdit, onDelete, onImageClick }: Spo[m
         </div>[m
 [m
         {/* Desktop Content - Right Side */}[m
[31m-        <div className="hidden md:flex flex-col flex-1 gap-4">[m
[31m-          {/* Title & Address */}[m
[31m-          <div className="space-y-3">[m
[31m-            <h1 className="text-5xl lg:text-6xl font-display font-bold text-white tracking-tight">[m
[31m-              {spot.name}[m
[31m-            </h1>[m
[31m-            <p className="text-white/60 font-bold uppercase tracking-widest text-sm flex items-center gap-2">[m
[31m-              <MapPin size={16} strokeWidth={3} className="text-amber-400 shrink-0" />[m
[31m-              <span className="truncate">{spot.address}</span>[m
[31m-            </p>[m
[31m-          </div>[m
[31m-[m
[31m-          {/* Primary Actions */}[m
[31m-          <div className="flex items-center gap-3">[m
[31m-            <button[m
[31m-              onClick={handleAcceptMission}[m
[31m-              disabled={addMission.isPending || isInMissions}[m
[31m-              className={cn([m
[31m-                "flex-1 px-6 py-4 rounded-2xl transition-all active:scale-95 border shadow-xl flex items-center justify-center gap-2 text-sm font-semibold tracking-wide",[m
[31m-                isInMissions[m
[31m-                  ? "bg-emerald-500/80 border-emerald-400 text-white"[m
[31m-                  : "bg-white/10 backdrop-blur-md text-white hover:bg-amber-400 border-white/20"[m
[31m-              )}[m
[31m-            >[m
[31m-              {addMission.isPending ? ([m
[31m-                <Loader2 size={18} className="animate-spin shrink-0" />[m
[31m-              ) : isInMissions ? ([m
[31m-                <>[m
[31m-                  <CheckCircle2 size={18} className="shrink-0" />[m
[31m-                  <span>Mission Accepted</span>[m
[31m-                </>[m
[31m-              ) : ([m
[32m+[m[32m        <div className="hidden md:flex flex-col flex-1 md:h-[420px] lg:h-[480px]">[m
[32m+[m[32m          {/* Top: Title, Address & Menu */}[m
[32m+[m[32m          <div className="flex items-start justify-between gap-4">[m
[32m+[m[32m            <div className="space-y-1 flex-1 min-w-0">[m
[32m+[m[32m              <TruncatedTextWithDialog[m
[32m+[m[32m                text={spot.name}[m
[32m+[m[32m                textClassName="text-3xl lg:text-4xl font-display font-bold text-white tracking-tight"[m
[32m+[m[32m              />[m
[32m+[m[32m              <TruncatedTextWithDialog[m
[32m+[m[32m                text={spot.address}[m
[32m+[m[32m                title="Full Address"[m
[32m+[m[32m                icon={<MapPin size={16} strokeWidth={3} className="text-amber-400 mt-0.5" />}[m
[32m+[m[32m                textClassName="text-white/60 font-bold uppercase tracking-widest text-xs leading-tight"[m
[32m+[m[32m              />[m
[32m+[m[32m            </div>[m
[32m+[m[41m            [m
[32m+[m[32m            <DropdownMenu trigger={<button className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white p-3 rounded-xl border border-white/10 shadow-xl transition-all shrink-0"><MoreVertical size={20} /></button>}>[m
[32m+[m[32m              <DropdownMenuItem onClick={handleShare} className="gap-3 py-3"><Share2 size={16} className="text-amber-400" /><span className="text-sm font-medium">Share Spot</span></DropdownMenuItem>[m
[32m+[m[32m              {isOwner && ([m
                 <>[m
[31m-                  <Target size={18} className="shrink-0" />[m
[31m-                  <span>Accept Mission</span>[m
[32m+[m[32m                  <DropdownMenuItem onClick={onEdit} className="gap-3 py-3"><Edit2 size={16} /><span>Edit Spot</span></DropdownMenuItem>[m
[32m+[m[32m                  <DropdownMenuItem onClick={onDelete} className="gap-3 py-3" danger><Trash2 size={16} /><span>Delete Spot</span></DropdownMenuItem>[m
                 </>[m
               )}[m
[31m-            </button>[m
[31m-            <button[m
[31m-              onClick={() =>[m
[31m-                router.push([m
[31m-                  `/navigate?lat=${spot.latitude}&lng=${spot.longitude}&name=${encodeURIComponent(spot.name)}`[m
[31m-                )[m
[31m-              }[m
[31m-              className="flex-1 bg-white/10 backdrop-blur-md text-white px-6 py-4 rounded-2xl hover:bg-amber-400 transition-all active:scale-95 border border-white/20 shadow-xl flex items-center justify-center gap-2 text-sm font-semibold tracking-wide"[m
[31m-              title="Navigate to this spot"[m
[31m-            >[m
[31m-              <Navigation size={18} />[m
[31m-              Navigate[m
[31m-            </button>[m
[31m-            <LikeButton[m
[31m-              count={spot._count?.votes || 0}[m
[31m-              isVoted={spot.hasVoted}[m
[31m-              onVote={handleSpotVoteClick}[m
[31m-              variant="default"[m
[31m-              size="lg"[m
[31m-              className="text-sm font-semibold tracking-wide px-6 py-4 rounded-2xl backdrop-blur-md border shadow-xl bg-white/10 border-white/20 hover:bg-amber-400/20 hover:border-amber-400/30"[m
[31m-              title={spot.hasVoted ? "Remove like" : "Like this spot"}[m
[31m-            />[m
[32m+[m[32m              <DropdownMenuItem asChild>[m
[32m+[m[32m                <ReportButton targetId={spot.id} reportType="SPOT" className="w-full flex items-center justify-start gap-3 py-3 px-4 text-sm font-medium hover:bg-white/5 transition-colors border-none text-white/70 hover:text-white">[m
[32m+[m[32m                  <Flag size={16} /><span>Report Spot</span>[m
[32m+[m[32m                </ReportButton>[m
[32m+[m[32m              </DropdownMenuItem>[m
[32m+[m[32m            </DropdownMenu>[m
           </div>[m
 [m
[31m-          {/* Divider */}[m
[31m-          <div className="border-t border-white/10 my-1" />[m
[31m-[m
[31m-          {/* Secondary Actions */}[m
[31m-          <div className="flex items-center gap-2">[m
[31m-            <button[m
[31m-              onClick={handleShare}[m
[31m-              className="flex-1 bg-white/5 backdrop-blur-md text-white/60 hover:text-white px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all border border-white/5 flex items-center justify-center gap-2 text-xs font-medium"[m
[31m-            >[m
[31m-              <Share2 size={14} />[m
[31m-              Share[m
[31m-            </button>[m
[31m-            {isOwner && ([m
[31m-              <>[m
[31m-                <button[m
[31m-                  onClick={onEdit}[m
[31m-                  className="bg-white/5 backdrop-blur-md text-white/60 hover:text-white px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all border border-white/5 flex items-center justify-center gap-2 text-xs font-medium"[m
[31m-                >[m
[31m-                  <Edit2 size={14} />[m
[31m-                  Edit[m
[31m-                </button>[m
[31m-                <button[m
[31m-                  onClick={onDelete}[m
[31m-                  className="bg-white/5 backdrop-blur-md text-red-400/60 hover:text-red-400 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-all border border-white/5 flex items-center justify-center gap-2 text-xs font-medium"[m
[31m-                >[m
[31m-                  <Trash2 size={14} />[m
[31m-                  Delete[m
[31m-                </button>[m
[31m-              </>[m
[31m-            )}[m
[31m-            <ReportButton[m
[31m-              targetId={spot.id}[m
[31m-              reportType="SPOT"[m
[31m-              className="bg-white/5 backdrop-blur-md text-white/60 hover:text-white px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all border border-white/5 flex items-center justify-center gap-2 text-xs font-medium"[m
[31m-            >[m
[31m-              <Flag size={14} />[m
[31m-              Report[m
[31m-            </ReportButton>[m
[32m+[m[32m          {/* Stats Grid */}[m
[32m+[m[32m          <SpotStatsGrid spot={spot} className="my-0 gap-4" />[m
[32m+[m
[32m+[m[32m          {/* Middle: Flexible Spacer - pushes buttons to bottom */}[m
[32m+[m[32m          <div className="flex-1" />[m
[32m+[m
[32m+[m[32m          {/* Bottom: Primary Actions, Divider, Secondary Actions */}[m
[32m+[m[32m          <div className="flex-shrink-0 space-y-2">[m
[32m+[m[32m            {/* Primary Actions */}[m
[32m+[m[32m            <div className="flex items-center gap-3">[m
[32m+[m[32m              <button[m
[32m+[m[32m                onClick={handleAcceptMission}[m
[32m+[m[32m                disabled={addMission.isPending || isInMissions}[m
[32m+[m[32m                className={cn([m
[32m+[m[32m                  "flex-1 px-6 py-4 rounded-2xl transition-all active:scale-95 border shadow-xl flex items-center justify-center gap-2 text-sm font-semibold tracking-wide",[m
[32m+[m[32m                  isInMissions[m
[32m+[m[32m                    ? "bg-emerald-500/80 border-emerald-400 text-white"[m
[32m+[m[32m                    : "bg-white/10 backdrop-blur-md text-white hover:bg-amber-400 border-white/20"[m
[32m+[m[32m                )}[m
[32m+[m[32m              >[m
[32m+[m[32m                {addMission.isPending ? ([m
[32m+[m[32m                  <Loader2 size={18} className="animate-spin shrink-0" />[m
[32m+[m[32m                ) : isInMissions ? ([m
[32m+[m[32m                  <>[m
[32m+[m[32m                    <CheckCircle2 size={18} className="shrink-0" />[m
[32m+[m[32m                    <span>Mission Accepted</span>[m
[32m+[m[32m                  </>[m
[32m+[m[32m                ) : ([m
[32m+[m[32m                  <>[m
[32m+[m[32m                    <Target size={18} className="shrink-0" />[m
[32m+[m[32m                    <span>Accept Mission</span>[m
[32m+[m[32m                  </>[m
[32m+[m[32m                )}[m
[32m+[m[32m              </button>[m
[32m+[m[32m              <button[m
[32m+[m[32m                onClick={() =>[m
[32m+[m[32m                  router.push([m
[32m+[m[32m                    `/navigate?lat=${spot.latitude}&lng=${spot.longitude}&name=${encodeURIComponent(spot.name)}`[m
[32m+[m[32m                  )[m
[32m+[m[32m                }[m
[32m+[m[32m                className="flex-1 bg-white/10 backdrop-blur-md text-white px-6 py-4 rounded-2xl hover:bg-amber-400 transition-all active:scale-95 border border-white/20 shadow-xl flex items-center justify-center gap-2 text-sm font-semibold tracking-wide cursor-pointer"[m
[32m+[m[32m                title="Navigate to this spot"[m
[32m+[m[32m              >[m
[32m+[m[32m                <Navigation size={18} />[m
[32m+[m[32m                Navigate[m
[32m+[m[32m              </button>[m
[32m+[m[32m              <LikeButton[m
[32m+[m[32m                count={spot._count?.votes || 0}[m
[32m+[m[32m                isVoted={spot.hasVoted}[m
[32m+[m[32m                onVote={handleSpotVoteClick}[m
[32m+[m[32m                variant="default"[m
[32m+[m[32m                size="lg"[m
[32m+[m[32m                className="text-sm font-semibold tracking-wide px-6 py-4 rounded-2xl backdrop-blur-md border shadow-xl bg-white/10 border-white/20 hover:bg-amber-400/20 hover:border-amber-400/30 cursor-pointer"[m
[32m+[m[32m                title={spot.hasVoted ? "Remove like" : "Like this spot"}[m
[32m+[m[32m              />[m
[32m+[m[32m            </div>[m
[32m+[m
[32m+[m[32m            {/* Divider */}[m
[32m+[m[32m            <div className="h-px bg-gradient-to-r from-white/0 via-white/20 to-white/0" />[m
           </div>[m
         </div>[m
       </div>[m
     </header>[m
[32m+[m[32m    </>[m
   );[m
 }[m
\ No newline at end of file[m
