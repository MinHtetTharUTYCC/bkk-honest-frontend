'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import {
    useSpot,
    useSpotBySlug,
    useSpotPriceReports,
    useInfiniteSpotTips,
    useSpotGallery,
    useUploadSpotImage,
    useMissions,
    useAddMission,
    useUpdateSpot,
    useCategories,
    useCities,
    useLiveVibes,
    useCreateLiveVibe,
    useUpdateCommunityTip,
    useDeleteCommunityTip,
} from '@/hooks/use-api';
import { useVoteToggle } from '@/hooks/use-vote-toggle';
import {
    MapPin,
    Zap,
    Info,
    ArrowLeft,
    TrendingDown,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Camera,
    Maximize2,
    Upload,
    Loader2,
    User,
    Trash2,
    Target,
    Edit2,
    Save,
    X,
    MessageSquare,
    Navigation,
    ImageIcon,
} from 'lucide-react';
import { LikeButton } from '@/components/ui/like-button';
import { ImageViewer } from '@/components/ui/image-viewer';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import GalleryModal from '@/components/spots/gallery-modal';
import LocationPicker from '@/components/spots/location-picker';
import CreateTipModal from '@/components/tips/create-tip-modal';
import TipCommentsModal from '@/components/tips/tip-comments-modal';
import EditTipModal from '@/components/tips/edit-tip-modal';
import { TipCard } from '@/components/tips/tip-card';
import ReportButton from '@/components/report/report-button';
import CreateVibeForm from '@/components/vibes/create-vibe-form';
import { Dropdown } from '@/components/ui/dropdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { MoreVertical, Flag, Share2 } from 'lucide-react';
import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import SpotEditModal from '@/components/spots/spot-edit-modal';
import { useInView } from 'react-intersection-observer';
import { ShareButton } from '@/components/ui/share-button';
import { TipFormValues } from '@/lib/validations/tip';

export default function SpotDetailPage() {
    const { citySlug, spotSlug } = useParams() as { citySlug: string; spotSlug: string };
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { data: spot, isLoading: spotLoading } = useSpotBySlug(citySlug, spotSlug);
    const { data: reports } = useSpotPriceReports(spot?.id || '');
    const { data: galleryResponse } = useSpotGallery(spot?.id || '', 6);
    const { data: missionsData } = useMissions();
    const addMission = useAddMission();
    const { data: spotVibes, isLoading: vibesLoading } = useLiveVibes({ spotId: spot?.id || '' });

    const missionsList = missionsData?.pages.flatMap((page) => page.data || []) || [];
    const isInMissions = missionsList.some((m: any) => m.spot?.id === spot?.id);
    const currentMission = missionsList.find((m: any) => m.spot?.id === spot?.id);
    const gallery = galleryResponse?.data || [];

    const isOwner = authUser?.id === spot?.userId;

    const [isClient, setIsClient] = useState(false);
    const [showGalleryModal, setShowGalleryModal] = useState(false);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [showTipModal, setShowTipModal] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedTip, setSelectedTip] = useState<any>(null);
    const [editingTip, setEditingTip] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'gallery' | 'prices' | 'tips' | 'vibes'>('tips');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isEditing, setIsEditing] = useState(false);

    const [tipType, setTipType] = useState<'TRY' | 'AVOID'>('TRY');
    const [tipSort, setTipSort] = useState<'popular' | 'newest'>('popular');

    const {
        data: tipsData,
        fetchNextPage: fetchNextTips,
        hasNextPage: hasNextTips,
        isFetchingNextPage: isFetchingNextTips,
        isLoading: tipsLoading,
    } = useInfiniteSpotTips(spot?.id || '', tipType, tipSort);

    const tips = tipsData?.pages.flatMap((page) => page.data) || [];

    // Infinite scroll trigger
    const { ref: observerTarget, inView } = useInView({ threshold: 0.1, rootMargin: '200px' });
    const hasFetchedTipsRef = useRef(false);

    useEffect(() => {
        if (inView && hasNextTips && !isFetchingNextTips && !hasFetchedTipsRef.current) {
            hasFetchedTipsRef.current = true;
            fetchNextTips();
        }
    }, [inView, hasNextTips, isFetchingNextTips, fetchNextTips]);

    useEffect(() => {
        if (!inView) {
            hasFetchedTipsRef.current = false;
        }
    }, [inView]);

    const uploadMutation = useUploadSpotImage();
    const { toggleVote: toggleTipVote, isPending: tipVotePending } = useVoteToggle(
        'tip',
        spot?.id || '',
    );
    const { toggleVote: toggleImageVote, isPending: imageVotePending } = useVoteToggle(
        'image',
        spot?.id || '',
    );
    const { toggleVote: toggleSpotVote } = useVoteToggle('spot');
    const updateTipMutation = useUpdateCommunityTip();
    const deleteTipMutation = useDeleteCommunityTip();

    const handleSpotVote = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleSpotVote({
            id: spot?.id || '',
            hasVoted: spot?.hasVoted,
            voteId: spot?.voteId,
        });
    };

    const handleSpotVoteClick = async () => {
        await toggleSpotVote({
            id: spot?.id || '',
            hasVoted: spot?.hasVoted,
            voteId: spot?.voteId,
        });
    };

    const queryClient = useQueryClient();
    const deleteSpotMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/spots/${spot?.id || ''}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spots'] });
            toast.success('Spot deleted');
            router.push('/');
        },
        onError: () => {
            toast.error('Failed to delete spot');
        }
    });

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        try {
            await uploadMutation.mutateAsync({ spotId: spot?.id || '', file });
        } finally {
            if (e.target) e.target.value = '';
        }
    };

    if (!isClient || spotLoading) {
        return (
            <div className="space-y-12 animate-pulse">
                <div className="h-64 bg-white/5 rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 h-96 bg-white/5 rounded-2xl" />
                    <div className="h-96 bg-white/5 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!spot) return <div>Spot not found</div>;

    const galleryList = Array.isArray(gallery) ? gallery : [];

    const handleEditTip = (tip: any) => {
        setEditingTip(tip);
    };

    const handleSaveEditedTip = async (values: TipFormValues) => {
        if (!editingTip) return;

        try {
            await updateTipMutation.mutateAsync({
                id: editingTip.id,
                spotId: spot?.id || '',
                ...values,
            });
            setEditingTip(null);
            toast.success('Tip updated');
        } catch (error) {
            console.error('Failed to update tip:', error);
            toast.error('Failed to update tip');
        }
    };

    const handleDeleteTip = async (tipId: string) => {
        try {
            await deleteTipMutation.mutateAsync({ id: tipId, spotId: spot?.id || '' });
            toast.success('Tip deleted');
        } catch (error) {
            console.error('Failed to delete tip:', error);
            toast.error('Failed to delete tip');
        }
    };

    return (
        <div className="space-y-12 pb-24">
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the spot
                            and all associated contributions (tips, photos, vibe checks).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteSpotMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                deleteSpotMutation.mutate();
                            }}
                            disabled={deleteSpotMutation.isPending}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            {deleteSpotMutation.isPending ? "Deleting..." : "Delete Spot"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {showGalleryModal && (
                <GalleryModal
                    spotId={spot?.id || ''}
                    spotName={spot.name}
                    onClose={() => setShowGalleryModal(false)}
                />
            )}
            {showTipModal && (
                <CreateTipModal spotId={spot?.id || ''} onClose={() => setShowTipModal(false)} />
            )}
            {editingTip && (
                <EditTipModal
                    tip={editingTip}
                    onSave={handleSaveEditedTip}
                    onClose={() => setEditingTip(null)}
                    isLoading={updateTipMutation.isPending}
                />
            )}
            {selectedTip && (
                <TipCommentsModal tip={selectedTip} onClose={() => setSelectedTip(null)} />
            )}

            {/* Edit Spot Modal */}
            {isEditing && (
                <SpotEditModal 
                    spot={spot} 
                    onClose={() => setIsEditing(false)} 
                />
            )}

            {/* 1. Header & Hero Image */}
            <header className="space-y-6">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-white/50 hover:text-amber-400 transition-colors"
                >
                    <ArrowLeft size={14} strokeWidth={3} />
                    Back
                </button>

                {/* Hero Image Section */}
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Column: Image & Top Badges */}
                    <div 
                        className="relative h-100 md:h-[420px] md:w-[420px] lg:h-[480px] lg:w-[480px] shrink-0 rounded-2xl overflow-hidden group shadow-2xl shadow-black/30 cursor-pointer bg-white/5 border border-white/8"
                        onClick={() => spot.imageUrl ? setShowImageViewer(true) : undefined}
                    >
                        {spot.imageUrl ? (
                            <img
                                src={spot.imageUrl}
                                alt={spot.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-3">
                                <ImageIcon size={64} strokeWidth={1} />
                                <span className="text-sm font-black uppercase tracking-widest">
                                    No Photo
                                </span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 md:from-transparent md:via-transparent via-transparent to-transparent" />

                        {/* Badge Container - top row (Both Mobile & Desktop) */}
                        <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                            <div 
                                className="flex items-center gap-2 pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span className="bg-black/40 backdrop-blur-md text-white/90 px-3 py-1.5 rounded-xl text-[12px] font-bold tracking-widest uppercase shadow-sm border border-white/10">
                                    {(spot.category as any)?.name}
                                </span>
                                <div className="bg-amber-400/90 backdrop-blur-md text-black px-3 py-1.5 rounded-xl flex items-center gap-1 font-bold text-[12px] tracking-widest uppercase shadow-lg shadow-amber-400/20 border border-amber-300/20">
                                    <Zap size={10} fill="currentColor" />
                                    {(spot.vibeStats as any)?.avgCrowdLevel
                                        ? `Busy: ${(spot.vibeStats as any).avgCrowdLevel.toFixed(1)}/5`
                                        : 'New Spot'}
                                </div>
                            </div>

                            {/* Dropdown Menu - Mobile Only (Desktop moved to right column) */}
                            <div 
                                className="pointer-events-auto md:hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <DropdownMenu
                                    trigger={
                                        <button className="bg-black/40 backdrop-blur-md text-white p-2.5 rounded-xl border border-white/20 shadow-xl active:scale-95 transition-transform">
                                            <MoreVertical size={18} />
                                        </button>
                                    }
                                >
                                    <DropdownMenuItem
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: spot.name,
                                                    text: `Check out ${spot.name} on BKK Honest! ⚡`,
                                                    url: window.location.href
                                                });
                                            }
                                        }}
                                        className="gap-3 py-3"
                                    >
                                        <Share2 size={16} className="text-amber-400" />
                                        <span className="text-sm font-medium">Share Spot</span>
                                    </DropdownMenuItem>

                                    {isOwner && (
                                        <>
                                            <DropdownMenuItem onClick={() => setIsEditing(true)} className="gap-3 py-3">
                                                <Edit2 size={16} />
                                                <span>Edit Spot</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setIsDeleteDialogOpen(true)}
                                                className="gap-3 py-3"
                                                danger
                                            >
                                                <Trash2 size={16} />
                                                <span>Delete Spot</span>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <ReportButton
                                            targetId={spot?.id || ''}
                                            reportType="SPOT"
                                            className="w-full flex items-center justify-start gap-3 py-3 px-4 text-sm font-medium hover:bg-white/5 transition-colors border-none text-white/70 hover:text-white"
                                        >
                                            <Flag size={16} />
                                            <span>Report Spot</span>
                                        </ReportButton>
                                    </DropdownMenuItem>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Mobile Info Overlay (Hidden on Desktop) */}
                        <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-between gap-6 md:hidden">
                            <div className="space-y-3">
                                <h1 className="text-4xl font-display font-bold text-white tracking-tight drop-shadow-sm line-clamp-2 break-words">
                                    {spot.name}
                                </h1>
                                <div className="space-y-1">
                                    <p className="text-white/60 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                        <MapPin
                                            size={14}
                                            strokeWidth={3}
                                            className="text-amber-400 shrink-0"
                                        />
                                        <span className="truncate">{spot.address}</span>
                                    </p>
                                    {spot.user && (
                                        <Link 
                                            href={`/profile/${spot.user.id}`}
                                            className="flex items-center gap-2 pl-[22px] group/author cursor-pointer"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="w-4 h-4 rounded-full bg-white/10 overflow-hidden shrink-0 group-hover/author:border-amber-400 transition-colors">
                                                <img 
                                                    src={spot.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${spot.user.id}`} 
                                                    alt={spot.user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <span className="text-[10px] text-white/40 font-semibold tracking-wide">
                                                Discovered by <span className="text-white/70 group-hover/author:text-amber-400 transition-colors">@{spot.user.name}</span>
                                            </span>
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div 
                                className="flex w-full items-center justify-between gap-3"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => !isInMissions && addMission.mutate(spot?.id || '')}
                                    disabled={addMission.isPending || isInMissions}
                                    className={cn(
                                        'flex-1 bg-white/10 backdrop-blur-md text-white px-4 py-4 rounded-2xl transition-all active:scale-95 border shadow-xl flex items-center justify-center gap-2 text-[10px] font-semibold tracking-wide',
                                        isInMissions
                                            ? 'bg-emerald-500/80 border-emerald-400 text-white'
                                            : 'hover:bg-amber-400 border-white/20',
                                    )}
                                >
                                    {addMission.isPending ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : isInMissions ? (
                                        <>
                                            <CheckCircle2 size={16} />
                                            <span>Accepted</span>
                                        </>
                                    ) : (
                                        <>
                                            <Target size={16} />
                                            <span>Accept</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() =>
                                        router.push(
                                            `/navigate?lat=${spot.latitude}&lng=${spot.longitude}&name=${encodeURIComponent(spot.name)}`,
                                        )
                                    }
                                    className="flex-1 bg-white/10 backdrop-blur-md text-white px-4 py-4 rounded-2xl hover:bg-amber-400 transition-all active:scale-95 border border-white/20 shadow-xl flex items-center justify-center gap-2 text-[10px] font-semibold tracking-wide"
                                    title="Navigate to this spot"
                                >
                                    <Navigation size={16} />
                                    Navigate
                                </button>

                                <LikeButton
                                    count={spot._count?.votes || 0}
                                    isVoted={spot.hasVoted}
                                    onVote={handleSpotVoteClick}
                                    variant="default"
                                    size="lg"
                                    className="text-[10px] font-semibold tracking-wide px-4 py-4 rounded-2xl backdrop-blur-md border shadow-xl bg-white/10 border-white/20 hover:bg-amber-400/20 hover:border-amber-400/30"
                                    title={spot.hasVoted ? 'Remove like' : 'Like this spot'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Info & Actions (Desktop Only) */}
                    <div className="hidden md:flex flex-1 flex-col justify-between bg-card rounded-2xl p-8 border border-border shadow-xl shadow-black/20">
                        {/* Top Section */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-4">
                                    <h1 className="text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-none line-clamp-2 break-words">
                                        {spot.name}
                                    </h1>
                                    <div className="space-y-2">
                                        <p className="text-white/60 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                                            <MapPin
                                                size={16}
                                                strokeWidth={3}
                                                className="text-amber-400 shrink-0"
                                            />
                                            {spot.address}
                                        </p>
                                        {spot.user && (
                                            <Link href={`/profile/${spot.user.id}`} className="flex items-center gap-2 pl-[26px] group/author">
                                                <div className="w-5 h-5 rounded-full bg-white/10 overflow-hidden shrink-0 border border-white/10 group-hover/author:border-amber-400 transition-colors">
                                                    <img 
                                                        src={spot.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${spot.user.id}`} 
                                                        alt={spot.user.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <span className="text-xs text-white/40 font-semibold tracking-wide">
                                                    Discovered by <span className="text-white/80 group-hover/author:text-amber-400 transition-colors cursor-pointer">@{spot.user.name}</span>
                                                </span>
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Desktop Dropdown Menu */}
                                <DropdownMenu
                                    trigger={
                                        <button className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl border border-border shadow-sm active:scale-95 transition-all shrink-0">
                                            <MoreVertical size={20} />
                                        </button>
                                    }
                                >
                                    <DropdownMenuItem
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: spot.name,
                                                    text: `Check out ${spot.name} on BKK Honest! ⚡`,
                                                    url: window.location.href
                                                });
                                            }
                                        }}
                                        className="gap-3 py-3"
                                    >
                                        <Share2 size={16} className="text-amber-400" />
                                        <span className="text-sm font-medium">Share Spot</span>
                                    </DropdownMenuItem>

                                    {isOwner && (
                                        <>
                                            <DropdownMenuItem onClick={() => setIsEditing(true)} className="gap-3 py-3">
                                                <Edit2 size={16} />
                                                <span>Edit Spot</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setIsDeleteDialogOpen(true)}
                                                className="gap-3 py-3"
                                                danger
                                            >
                                                <Trash2 size={16} />
                                                <span>Delete Spot</span>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <ReportButton
                                            targetId={spot?.id || ''}
                                            reportType="SPOT"
                                            className="w-full flex items-center justify-start gap-3 py-3 px-4 text-sm font-medium hover:bg-white/5 transition-colors border-none text-white/70 hover:text-white"
                                        >
                                            <Flag size={16} />
                                            <span>Report Spot</span>
                                        </ReportButton>
                                    </DropdownMenuItem>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Bottom Section: Actions */}
                        <div className="flex items-center gap-4 mt-8 pt-8 border-t border-border">
                            <button
                                onClick={() => !isInMissions && addMission.mutate(spot?.id || '')}
                                disabled={addMission.isPending || isInMissions}
                                className={cn(
                                    'flex-1 bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-2xl transition-all active:scale-95 border border-border shadow-sm flex items-center justify-center gap-3 text-xs font-bold tracking-widest uppercase',
                                    isInMissions
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                        : 'hover:border-amber-400/50 hover:text-amber-400',
                                )}
                            >
                                {addMission.isPending ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : isInMissions ? (
                                    <>
                                        <CheckCircle2 size={18} />
                                        <span>Mission Accepted</span>
                                    </>
                                ) : (
                                    <>
                                        <Target size={18} />
                                        <span>Accept Mission</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() =>
                                    router.push(
                                        `/navigate?lat=${spot.latitude}&lng=${spot.longitude}&name=${encodeURIComponent(spot.name)}`,
                                    )
                                }
                                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black px-6 py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-3 text-xs font-bold tracking-widest uppercase"
                                title="Navigate to this spot"
                            >
                                <Navigation size={18} />
                                Navigate
                            </button>

                            <LikeButton
                                count={spot._count?.votes || 0}
                                isVoted={spot.hasVoted}
                                onVote={handleSpotVoteClick}
                                variant="default"
                                size="lg"
                                className="bg-white/5 hover:bg-white/10 border-border text-xs font-bold tracking-widest px-6 py-4 rounded-2xl shadow-sm hover:border-amber-400/50 hover:text-amber-400"
                                title={spot.hasVoted ? 'Remove like' : 'Like this spot'}
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. Key Data Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-xl shadow-black/20">
                    <span className="text-[8px] md:text-[10px] font-medium text-white/50 uppercase tracking-widest block mb-2 md:mb-4">
                        Avg Price (THB)
                    </span>
                    <div className="text-2xl md:text-4xl font-display font-bold text-white">
                        {(spot.priceStats as any)?.avg
                            ? `${(spot.priceStats as any).avg.toFixed(0)}`
                            : '--'}
                    </div>
                    <div className="mt-1 md:mt-2 text-[8px] md:text-[10px] font-medium text-white/50 uppercase tracking-widest">
                        Across {(spot.priceStats as any)?.count || 0} Reports
                    </div>
                </div>
                <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-xl shadow-black/20">
                    <span className="text-[8px] md:text-[10px] font-medium text-white/50 uppercase tracking-widest block mb-2 md:mb-4">
                        Fair Range
                    </span>
                    <div className="text-lg md:text-xl font-display font-bold text-white flex items-center gap-1 md:gap-2">
                        <span className="text-emerald-500 italic">
                            {(spot.priceStats as any)?.min || '--'}
                        </span>
                        <span className="text-white/20">-</span>
                        <span className="text-red-500 italic">
                            {(spot.priceStats as any)?.max || '--'}
                        </span>
                    </div>
                    <div className="mt-1 md:mt-2 text-[8px] md:text-[10px] font-medium text-white/50 uppercase tracking-widest italic">
                        THB Range
                    </div>
                </div>
                <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-xl shadow-black/20">
                    <span className="text-[8px] md:text-[10px] font-medium text-white/50 uppercase tracking-widest block mb-2 md:mb-4">
                        Live Vibe
                    </span>
                    <div className="text-lg md:text-xl font-display font-bold text-white">
                        {(spot.vibeStats as any)?.avgCrowdLevel
                            ? `${(spot.vibeStats as any).avgCrowdLevel.toFixed(1)} / 5`
                            : 'No Data'}
                    </div>
                    <div className="mt-1 md:mt-2 text-[8px] md:text-[10px] font-medium text-white/50 uppercase tracking-widest">
                        Crowd Rating
                    </div>
                </div>
                <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-xl shadow-black/20">
                    <span className="text-[8px] md:text-[10px] font-medium text-white/50 uppercase tracking-widest block mb-2 md:mb-4">
                        Verified by
                    </span>
                    <div className="text-lg md:text-xl font-display font-bold text-white">
                        {reports?.length || 0} Locals
                    </div>
                    <div className="mt-1 md:mt-2 text-[8px] md:text-[10px] font-medium text-white/50 uppercase tracking-widest">
                        Community Score
                    </div>
                </div>
            </div>

            {/* Mobile Tabs Switcher */}
            <div className="md:hidden sticky top-0 bg-card/80 backdrop-blur-md z-30 -mx-4 px-4 py-3 border-b border-border">
                <div className="flex bg-white/5 p-1 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('gallery')}
                        className={cn(
                            'flex-1 py-2.5 rounded-xl text-[10px] font-semibold tracking-wide transition-all',
                            activeTab === 'gallery'
                                ? 'bg-white text-amber-400 shadow-sm'
                                : 'text-white/50',
                        )}
                    >
                        Gallery
                    </button>
                    <button
                        onClick={() => setActiveTab('prices')}
                        className={cn(
                            'flex-1 py-2.5 rounded-xl text-[10px] font-semibold tracking-wide transition-all',
                            activeTab === 'prices'
                                ? 'bg-white text-amber-400 shadow-sm'
                                : 'text-white/50',
                        )}
                    >
                        Prices
                    </button>
                    <button
                        onClick={() => setActiveTab('tips')}
                        className={cn(
                            'flex-1 py-2.5 rounded-xl text-[10px] font-semibold tracking-wide transition-all',
                            activeTab === 'tips'
                                ? 'bg-white text-amber-400 shadow-sm'
                                : 'text-white/50',
                        )}
                    >
                        Tips
                    </button>
                    <button
                        onClick={() => setActiveTab('vibes')}
                        className={cn(
                            'flex-1 py-2.5 rounded-xl text-[10px] font-semibold tracking-wide transition-all',
                            activeTab === 'vibes'
                                ? 'bg-white text-amber-400 shadow-sm'
                                : 'text-white/50',
                        )}
                    >
                        Vibes
                    </button>
                </div>
            </div>

            {/* 3. Image Gallery */}
            <section
                className={cn('space-y-8 md:block', activeTab === 'gallery' ? 'block' : 'hidden')}
            >
                <header className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <Camera size={20} className="text-amber-400" />
                        <h3 className="text-2xl font-display font-bold text-white">
                            <span className="md:hidden">Vibe</span>
                            <span className="hidden md:block">Vibe Gallery</span>
                        </h3>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadMutation.isPending}
                            className="group bg-amber-500 text-black hover:text-white px-6 py-3 rounded-xl text-[10px] font-semibold tracking-wide hover:bg-amber-400 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                        >
                            {uploadMutation.isPending ? (
                                <Loader2
                                    size={14}
                                    className="animate-spin text-black group-hover:text-white"
                                />
                            ) : (
                                <Upload
                                    size={14}
                                    className="text-black group-hover:text-white transition-colors"
                                />
                            )}
                            <span className="hidden md:inline">
                                {uploadMutation.isPending ? 'Uploading...' : 'Upload Vibe'}
                            </span>
                            <span className="md:hidden">
                                {uploadMutation.isPending ? '...' : 'Upload'}
                            </span>
                        </button>
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                        {((galleryResponse as any)?.pagination?.total || galleryList.length) > 0 && (
                            <button
                                onClick={() => setShowGalleryModal(true)}
                                className="text-[10px] font-medium text-amber-500 uppercase tracking-widest hover:text-amber-400 transition-colors flex items-center gap-2"
                            >
                                <span className="hidden md:inline">
                                    View All{' '}
                                    {(galleryResponse as any)?.pagination?.total || galleryList.length}{' '}
                                    Photos
                                </span>
                                <span className="md:hidden">
                                    All (
                                    {(galleryResponse as any)?.pagination?.total || galleryList.length})
                                </span>
                                <Maximize2 size={12} />
                            </button>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {galleryList.length === 0 ? (
                        <div className="col-span-full py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/20">
                            <p className="text-sm font-semibold text-white/40 tracking-wide">
                                No vibe photos yet
                            </p>
                        </div>
                    ) : (
                        <>
                            {galleryList.slice(0, 5).map((img: any) => (
                                <div
                                    key={img.id}
                                    className="aspect-square rounded-2xl overflow-hidden shadow-lg shadow-black/20 group relative border border-border"
                                >
                                    <img
                                        src={`${img.url}?w=300&h=300&fit=crop`}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110 cursor-pointer"
                                        alt="Spot Vibe"
                                        onClick={() => setShowGalleryModal(true)}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = img.url;
                                        }}
                                    />
                                    <div className="absolute top-3 right-3 flex bg-white/10 p-0.5 rounded-lg border border-border shadow-sm">
                                        <LikeButton
                                            count={img._count?.votes || 0}
                                            isVoted={img.hasVoted}
                                            onVote={async () => {
                                                await toggleImageVote(img);
                                            }}
                                            isPending={imageVotePending}
                                            disabled={imageVotePending}
                                            variant="overlay"
                                            size="sm"
                                            className="text-xs font-semibold gap-1.5 px-4 py-2 rounded-md bg-white/0 hover:bg-white/0"
                                            title={
                                                img.hasVoted
                                                    ? 'Unlike this image'
                                                    : 'Like this image'
                                            }
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-[8px] font-semibold text-white tracking-widest">
                                            by {img.user?.name || 'local'}
                                        </span>
                                        {img.user?.level && (
                                            <span className="bg-cyan-400 text-white px-1.5 py-0.5 rounded-md text-[8px] font-bold tracking-tighter mt-1">
                                                Lvl{' '}
                                                {img.user.level === 'LOCAL_GURU'
                                                    ? '3'
                                                    : img.user.level === 'EXPLORER'
                                                      ? '2'
                                                      : '1'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(galleryResponse as any)?.pagination?.total &&
                            (galleryResponse as any).pagination.total > 5 ? (
                                <button
                                    onClick={() => setShowGalleryModal(true)}
                                    className="aspect-square rounded-xl bg-amber-500 text-white flex flex-col items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition-transform"
                                >
                                    <span className="text-xl font-display font-bold">
                                        +{(galleryResponse as any).pagination.total - 5}
                                    </span>
                                    <span className="text-[8px] font-semibold tracking-wide">
                                        More Vibes
                                    </span>
                                </button>
                            ) : galleryList.length > 5 ? (
                                <button
                                    onClick={() => setShowGalleryModal(true)}
                                    className="aspect-square rounded-xl bg-amber-500 text-white flex flex-col items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition-transform"
                                >
                                    <span className="text-xl font-display font-bold">
                                        +{galleryList.length - 5}
                                    </span>
                                    <span className="text-[8px] font-semibold tracking-wide">
                                        More Vibes
                                    </span>
                                </button>
                            ) : null}
                        </>
                    )}
                </div>
            </section>

            {/* 4. Detailed Data Sections */}
            <div className="flex flex-col gap-12">
                {/* Price History Table */}
                <section
                    className={cn(
                        'space-y-8 md:block',
                        activeTab === 'prices' ? 'block' : 'hidden',
                    )}
                >
                    <header className="flex items-center justify-between px-2">
                        <h3 className="text-2xl font-display font-bold text-white">
                            Recent Price Reports
                        </h3>
                        <Info size={16} className="text-white/40" />
                    </header>
                    <div className="bg-card rounded-2xl border border-border shadow-xl shadow-black/20 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="px-8 py-6 text-xs font-semibold tracking-wide text-white/50">
                                        Item Name
                                    </th>
                                    <th className="px-8 py-6 text-xs font-semibold tracking-wide text-white/50">
                                        Price
                                    </th>
                                    <th className="px-8 py-6 text-xs font-semibold tracking-wide text-white/50">
                                        Status
                                    </th>
                                    <th className="px-8 py-6 text-xs font-semibold tracking-wide text-white/50">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {!Array.isArray(reports) || reports.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-8 py-20 text-center text-sm font-medium text-white/40"
                                        >
                                            No reports yet
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((r: any) => (
                                        <tr
                                            key={r.id}
                                            className="hover:bg-white/5 transition-colors"
                                        >
                                            <td className="px-8 py-6 text-sm font-semibold text-white">
                                                {r.itemName}
                                            </td>
                                            <td className="px-8 py-6 text-sm font-semibold text-amber-400 italic">
                                                {r.priceThb} THB
                                            </td>
                                            <td className="px-8 py-6">
                                                <div
                                                    className={cn(
                                                        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold tracking-tighter',
                                                        Number(r.priceThb) <=
                                                            (spot.priceStats as any).avg
                                                            ? 'bg-emerald-50 text-emerald-500'
                                                            : 'bg-red-50 text-red-500',
                                                    )}
                                                >
                                                    {Number(r.priceThb) <=
                                                    (spot.priceStats as any).avg ? (
                                                        <TrendingDown size={10} />
                                                    ) : (
                                                        <TrendingUp size={10} />
                                                    )}
                                                    {Number(r.priceThb) <=
                                                    (spot.priceStats as any).avg
                                                        ? 'Fair Price'
                                                        : 'Expensive'}
                                                </div>
                                            </td>
                                            <td
                                                className="px-8 py-6 text-[10px] font-medium text-white/50 uppercase tracking-widest"
                                                suppressHydrationWarning
                                            >
                                                {new Date(r.timestamp).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Community Tips (Avoid/Try) */}
                <section
                    className={cn('space-y-8 md:block', activeTab === 'tips' ? 'block' : 'hidden')}
                >
                    <header className="flex flex-col gap-6 px-2">
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="text-2xl font-display font-bold text-white">Tips</h3>
                            <button
                                onClick={() => {
                                    if (!authUser) {
                                        router.push(
                                            `/login?redirectTo=${encodeURIComponent(pathname)}`,
                                        );
                                        return;
                                    }
                                    setShowTipModal(true);
                                }}
                                className="group bg-amber-500 text-black hover:text-white px-6 py-3 rounded-xl text-[10px] font-semibold tracking-wide hover:bg-amber-400 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <Zap
                                    size={14}
                                    fill="currentColor"
                                    className="text-black group-hover:text-white transition-colors"
                                />
                                <span className="hidden sm:inline">Share a New Tip</span>
                                <span className="sm:hidden">New Tip</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setTipType('TRY')}
                                    className={cn(
                                        'flex-1 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all border',
                                        tipType === 'TRY'
                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                            : 'bg-white/5 text-white/50 border-border hover:bg-white/10',
                                    )}
                                >
                                    To Try
                                </button>
                                <button
                                    onClick={() => setTipType('AVOID')}
                                    className={cn(
                                        'flex-1 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all border',
                                        tipType === 'AVOID'
                                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                            : 'bg-white/5 text-white/50 border-border hover:bg-white/10',
                                    )}
                                >
                                    To Avoid
                                </button>
                            </div>
                        </div>
                    </header>

                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <div className="flex bg-white/5 p-1 rounded-xl w-fit border border-border">
                                <button
                                    onClick={() => setTipSort('popular')}
                                    className={cn(
                                        'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all',
                                        tipSort === 'popular'
                                            ? 'bg-white/10 text-amber-400'
                                            : 'text-white/50 hover:text-white/70',
                                    )}
                                >
                                    Popular
                                </button>
                                <button
                                    onClick={() => setTipSort('newest')}
                                    className={cn(
                                        'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all',
                                        tipSort === 'newest'
                                            ? 'bg-white/10 text-amber-400'
                                            : 'text-white/50 hover:text-white/70',
                                    )}
                                >
                                    Newest
                                </button>
                            </div>
                        </div>
                        {tipsLoading ? (
                            <div className="py-20 flex justify-center">
                                <Loader2 size={24} className="text-amber-400 animate-spin" />
                            </div>
                        ) : tips?.length === 0 ? (
                            <div className="py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/20 text-xs font-medium text-white/40">
                                Be the first to share a {tipType.toLowerCase()} tip
                            </div>
                        ) : (
                            <ScrollArea className="h-150 pr-4">
                                <div className="space-y-2.5 pb-8">
                                    {tips?.map((tip: any) => (
                                        <TipCard
                                            key={tip.id}
                                            tip={tip}
                                            authUser={authUser}
                                            onCommentClick={() => setSelectedTip(tip)}
                                            onVoteClick={async () => toggleTipVote(tip)}
                                            onEditClick={() => handleEditTip(tip)}
                                            onDeleteClick={() => handleDeleteTip(tip.id)}
                                        />
                                    ))}

                                    {/* Infinite scroll target */}
                                    <div ref={observerTarget} className="py-6 flex justify-center">
                                        {isFetchingNextTips ? (
                                            <Loader2
                                                size={20}
                                                className="text-amber-400 animate-spin"
                                            />
                                        ) : hasNextTips ? (
                                            <div className="h-4 w-4" />
                                        ) : (
                                            <p className="text-[10px] font-semibold text-white/40 tracking-wide">
                                                End of tips
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </section>

                {/* Live Vibes Section */}
                <section
                    className={cn('space-y-8 md:block', activeTab === 'vibes' ? 'block' : 'hidden')}
                >
                    <header className="flex items-center justify-between px-2">
                        <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                            <Zap size={20} className="text-amber-400" />
                            Live Vibes
                        </h3>
                    </header>

                    {/* Check-in Form */}
                    {authUser && <CreateVibeForm spotId={spot?.id || ''} onSuccess={() => {}} />}

                    {/* Vibe List */}
                    {vibesLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-20 bg-white/5 rounded-2xl animate-pulse"
                                />
                            ))}
                        </div>
                    ) : Array.isArray(spotVibes) && spotVibes.length > 0 ? (
                        <div className="space-y-3">
                            {spotVibes.map((vibe: any) => (
                                <div
                                    key={vibe.id}
                                    className="bg-white/5 rounded-2xl p-5 border border-white/8 flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        'w-2 h-6 rounded-full transition-colors',
                                                        i < vibe.crowdLevel
                                                            ? 'bg-amber-400'
                                                            : 'bg-white/10',
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">
                                                Crowd: {vibe.crowdLevel}/5
                                            </p>
                                            {vibe.waitTimeMinutes != null && (
                                                <p className="text-xs text-white/50">
                                                    {vibe.waitTimeMinutes} min wait
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-white/30 whitespace-nowrap">
                                        {new Date(vibe.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <Zap size={32} className="text-white/10 mx-auto mb-3" />
                            <p className="text-sm font-bold text-white/40 uppercase tracking-widest">
                                No vibes yet. Be the first to check in!
                            </p>
                        </div>
                    )}
                </section>
            </div>

            <ImageViewer
                isOpen={showImageViewer}
                imageUrl={spot.imageUrl || ''}
                alt={spot.name}
                onClose={() => setShowImageViewer(false)}
            />
        </div>
    );
}
