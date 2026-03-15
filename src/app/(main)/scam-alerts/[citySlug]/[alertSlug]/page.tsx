'use client';

import { useParams, useRouter } from 'next/navigation';
import {
    useScamAlertBySlug,
    useScamComments,
    useCreateComment,
    useUpdateComment,
    useDeleteComment,
    useDeleteScamAlert,
} from '@/hooks/use-api';
import { useVoteToggle } from '@/hooks/use-vote-toggle';
import {
    X,
    AlertTriangle,
    MessageSquare,
    Edit2,
    Trash2,
    Send,
    Loader2,
    User,
    Calendar,
    ShieldCheck,
    MapPin,
    ArrowLeft,
    MoreVertical,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useInView } from 'react-intersection-observer';
import ReactionButton from '@/components/reactions/reaction-button';
import ReportButton from '@/components/report/report-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ImageViewer } from '@/components/ui/image-viewer';
import Image from 'next/image';
import ScamEditModal from '@/components/scams/scam-edit-modal';
import { LikeButton } from '@/components/ui/like-button';

export default function ScamAlertDetailPage() {
    const { citySlug, alertSlug } = useParams() as { citySlug: string; alertSlug: string };
    const { user } = useAuth();
    const router = useRouter();
    const { data: alert, isLoading: alertLoading } = useScamAlertBySlug(
        citySlug === 'thailand' ? '' : citySlug,
        alertSlug,
    );
    const [localAlert, setLocalAlert] = useState<any>(alert);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showImageViewer, setShowImageViewer] = useState(false);

    useEffect(() => {
        if (alert) {
            setLocalAlert(alert);
        }
    }, [alert]);

    const {
        data: commentsResponse,
        isLoading: commentsLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useScamComments(alert?.id || '');

    const comments =
        commentsResponse?.pages?.flatMap(
            (page) => page.data || (Array.isArray(page) ? page : []),
        ) || [];
    const createCommentMutation = useCreateComment();
    const { toggleVote, isPending: votePending } = useVoteToggle('alert');
    const [newComment, setNewComment] = useState('');

    const updateCommentMutation = useUpdateComment();
    const deleteCommentMutation = useDeleteComment();
    const deleteScamAlertMutation = useDeleteScamAlert();
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleSendComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || !alert) return;

        try {
            await createCommentMutation.mutateAsync({
                scamAlertId: alert.id,
                content: newComment.trim(),
            });
            setNewComment('');
        } catch (err) {
            console.error(err);
            alert('Failed to post comment');
        }
    };

    const handleEditSubmit = async (commentId: string) => {
        if (!editContent.trim() || !alert) return;
        try {
            await updateCommentMutation.mutateAsync({
                id: commentId,
                content: editContent.trim(),
                scamAlertId: alert.id,
            });
            setEditingCommentId(null);
        } catch (err) {
            console.error(err);
            alert('Failed to update comment');
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        if (!alert) return;
        try {
            await deleteCommentMutation.mutateAsync({ id: commentId, scamAlertId: alert.id });
        } catch (err) {
            console.error(err);
            alert('Failed to delete comment');
        }
    };

    const handleVoteToggle = async () => {
        if (!user) {
            import('sonner').then(m => m.toast.error('Please join us first to like this!'));
            return;
        }
        if (!localAlert) return;

        const wasVoted = Boolean(localAlert.hasVoted);

        setLocalAlert((prev: any) => ({
            ...prev,
            hasVoted: !wasVoted,
            voteId: wasVoted ? null : 'temp-id',
            _count: {
                ...prev._count,
                votes: Math.max(0, (prev._count?.votes || 0) + (wasVoted ? -1 : 1)),
            },
        }));

        const result = await toggleVote(localAlert);

        setLocalAlert((prev: any) => ({
            ...prev,
            hasVoted: Boolean(result.voteId),
            voteId: result.voteId,
        }));
    };

    const handleDeleteAlert = async () => {
        if (!confirm('Are you sure you want to delete this scam alert?')) return;
        try {
            await deleteScamAlertMutation.mutateAsync(alert.id);
            router.push('/scam-alerts');
        } catch (err) {
            console.error(err);
            alert('Failed to delete alert');
        }
    };

    if (alertLoading || !localAlert) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-amber-400" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="border-b bg-background">
                <div className="mx-auto max-w-2xl px-4 py-4 flex items-center">
                    <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-lg">
                        <ArrowLeft size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <ScrollArea className="h-[calc(100vh-80px)]">
                <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
                    {/* Hero Image */}
                    {localAlert.imageUrl && (
                        <div 
                            className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl cursor-pointer group"
                            onClick={() => setShowImageViewer(true)}
                        >
                            <Image
                                src={localAlert.imageUrl}
                                alt={localAlert.scamName}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                            />
                        </div>
                    )}

                    {/* Alert Header */}
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                    <AlertTriangle size={24} className="text-red-500" />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-3xl font-display font-bold text-foreground tracking-tight leading-tight">
                                        {localAlert.scamName}
                                    </h1>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                                        {localAlert.city?.name && (
                                            <div className="flex items-center gap-1.5 text-amber-400">
                                                <MapPin size={14} />
                                                <span>{localAlert.city.name}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 text-white/50 ml-2">
                                            <Calendar size={14} />
                                            <span>
                                                {new Date(
                                                    localAlert.createdAt,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {user && (
                                    <DropdownMenu
                                        trigger={
                                            <button className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors bg-white/5 border border-white/10">
                                                <MoreVertical size={20} />
                                            </button>
                                        }
                                    >
                                        {user.id === localAlert.userId ? (
                                            <>
                                                <DropdownMenuItem
                                                    onClick={() => setIsEditModalOpen(true)}
                                                    className="gap-3 py-3"
                                                >
                                                    <Edit2 size={16} />
                                                    <span className="text-sm font-medium">
                                                        Edit Alert
                                                    </span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={handleDeleteAlert}
                                                    className="gap-3 py-3"
                                                    danger
                                                >
                                                    <Trash2 size={16} />
                                                    <span className="text-sm font-medium">
                                                        Delete Alert
                                                    </span>
                                                </DropdownMenuItem>
                                            </>
                                        ) : (
                                            <DropdownMenuItem asChild>
                                                <ReportButton
                                                    targetId={localAlert.id}
                                                    reportType="SCAM_ALERT"
                                                    className="w-full flex items-center justify-start gap-3 px-3 py-3 text-sm font-medium hover:bg-white/5 rounded-md transition-colors border-none"
                                                />
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>

                        {/* Description Box */}
                        {localAlert.description && (
                            <div className="p-6 bg-white/5 border border-white/8 rounded-[24px]">
                                <p className="text-base text-white/70 leading-relaxed font-medium">
                                    {localAlert.description}
                                </p>
                            </div>
                        )}

                        {/* Prevention Tip Box */}
                        {localAlert.preventionTip && (
                            <div className="p-6 bg-emerald-400/5 border border-emerald-400/20 rounded-[24px] flex gap-4">
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                        How to avoid this
                                    </h4>
                                    <p className="text-sm font-medium text-emerald-100/70 leading-relaxed">
                                        {localAlert.preventionTip}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Vote & Meta */}
                        <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/60 overflow-hidden border border-white/10">
                                    {localAlert.user?.avatarUrl ? (
                                        <img
                                            src={localAlert.user.avatarUrl}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User size={18} />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white uppercase tracking-tight">
                                        {localAlert.user?.name || 'Local Expert'}
                                    </span>
                                    {localAlert.user?.level && (
                                        <span className="text-[8px] font-bold text-amber-400 uppercase tracking-tighter">
                                            {localAlert.user.level.replace('_', ' ')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="min-w-30">
                                <LikeButton
                                    count={localAlert._count?.votes || 0}
                                    isVoted={localAlert.hasVoted}
                                    onVote={handleVoteToggle}
                                    isPending={votePending}
                                    disabled={votePending}
                                    variant="default"
                                    size="sm"
                                    className="text-[11px] font-black uppercase tracking-widest gap-2 px-6 py-2.5 rounded-xl border shadow-sm w-full justify-center bg-white/5 border-white/10 hover:border-amber-400/20"
                                    title={
                                        localAlert.hasVoted ? 'Remove upvote' : 'Upvote this alert'
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t" />

                    <div className="space-y-6">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                                <MessageSquare size={20} className="text-amber-400" />
                                What others says ({comments.length})
                            </h2>
                        </div>

                        {/* Comment Input */}
                        {user ? (
                            <form onSubmit={handleSendComment} className="relative group">
                                <textarea
                                    placeholder="Share your experience or ask a question..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-16 text-sm font-medium focus:outline-none focus:border-amber-400 transition-all placeholder:text-white/30 shadow-sm min-h-25 resize-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || createCommentMutation.isPending}
                                    className="absolute right-3 bottom-3 w-10 h-10 flex items-center justify-center bg-white/8 text-white/60 rounded-xl hover:bg-amber-400 hover:text-black transition-all active:scale-95 disabled:opacity-50 disabled:bg-white/5"
                                >
                                    {createCommentMutation.isPending ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Send size={18} />
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="p-6 bg-white/5 rounded-2xl text-center border border-dashed border-white/10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                                    Sign in to join the conversation
                                </p>
                            </div>
                        )}

                        {/* Comments List */}
                        <div className="space-y-4">
                            {commentsLoading && comments.length === 0 ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="animate-spin text-amber-400" size={32} />
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10 text-[10px] font-black uppercase tracking-widest text-white/30">
                                    No one's talking yet.
                                </div>
                            ) : (
                                comments.map((comment: any) => (
                                    <div
                                        key={comment.id}
                                        className="p-5 bg-white/5 border border-white/8 rounded-2xl space-y-3"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/40 overflow-hidden border border-white/5">
                                                    {comment.user?.avatarUrl ? (
                                                        <img
                                                            src={comment.user.avatarUrl}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User size={14} />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-white uppercase tracking-tight">
                                                            {comment.user?.name || 'Local'}
                                                        </span>
                                                        {comment.user?.level && (
                                                            <span className="text-[7px] font-bold text-amber-400/60 border border-amber-400/10 px-1 py-0.5 rounded uppercase tracking-tighter">
                                                                {comment.user.level.replace(
                                                                    '_',
                                                                    ' ',
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[12px] font-medium text-white/20 uppercase tracking-widest">
                                                        {new Date(
                                                            comment.createdAt,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <DropdownMenu
                                                trigger={
                                                    <button
                                                        disabled={editingCommentId === comment.id}
                                                        className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <MoreVertical size={14} />
                                                    </button>
                                                }
                                            >
                                                {user?.id === comment.userId && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setEditingCommentId(comment.id);
                                                                setEditContent(comment.content);
                                                            }}
                                                            className="gap-2 py-3"
                                                        >
                                                            <Edit2 size={14} />
                                                            <span className="text-sm font-medium">
                                                                Edit
                                                            </span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleDeleteComment(comment.id)
                                                            }
                                                            className="gap-2 py-3"
                                                            danger
                                                        >
                                                            <Trash2 size={14} />
                                                            <span className="text-sm font-medium">
                                                                Delete
                                                            </span>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}

                                                <DropdownMenuItem asChild>
                                                    <ReportButton
                                                        targetId={comment.id}
                                                        reportType="COMMENT"
                                                        className="w-full flex items-center justify-start gap-3 px-4 py-3 text-sm font-medium hover:bg-white/5 rounded-md transition-colors border-none"
                                                    >
                                                        <div className="text-white/70">Report</div>
                                                    </ReportButton>
                                                </DropdownMenuItem>
                                            </DropdownMenu>
                                        </div>

                                        {editingCommentId === comment.id ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 min-h-20 resize-none"
                                                />
                                                <div className="flex gap-2 justify-end pt-1">
                                                    <button
                                                        onClick={() => setEditingCommentId(null)}
                                                        className="px-4 py-2 bg-white/5 text-white/50 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/10"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditSubmit(comment.id)}
                                                        disabled={updateCommentMutation.isPending}
                                                        className="px-4 py-2 bg-amber-400 text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-amber-300 disabled:opacity-50"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <p className="text-sm text-white/70 font-medium leading-relaxed whitespace-pre-wrap">
                                                    {comment.content}
                                                </p>
                                                <div className="flex items-center gap-2 pt-1">
                                                    <ReactionButton
                                                        commentId={comment.id}
                                                        initialCount={comment.reactionCount || 0}
                                                        initialUserReacted={
                                                            comment.userHasReacted || false
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}

                            {/* Load more trigger */}
                            <div ref={ref} className="flex justify-center py-6">
                                {isFetchingNextPage ? (
                                    <Loader2 className="animate-spin text-amber-400" size={24} />
                                ) : hasNextPage ? (
                                    <span className="text-[12px] font-black uppercase tracking-widest text-white/50">
                                        Scroll for more
                                    </span>
                                ) : comments.length > 0 ? (
                                    <span className="text-[12px] font-black uppercase tracking-widest text-white/50">
                                        End of conversation
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <ScamEditModal alert={localAlert} onClose={() => setIsEditModalOpen(false)} />
            )}

            {/* Image Viewer */}
            {localAlert.imageUrl && (
                <ImageViewer
                    isOpen={showImageViewer}
                    imageUrl={localAlert.imageUrl}
                    alt={localAlert.scamName}
                    onClose={() => setShowImageViewer(false)}
                />
            )}
        </div>
    );
}
