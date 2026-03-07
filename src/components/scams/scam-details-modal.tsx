'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import {
    X,
    AlertTriangle,
    MessageSquare, Edit2, Trash2,
    Send,
    Loader2,
    Heart,
    User,
    Calendar,
    ShieldCheck,
    MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScamComments, useCreateComment, useUpdateComment, useDeleteComment } from '@/hooks/use-api';
import { useAuth } from '@/components/providers/auth-provider';
import { useVoteToggle } from '@/hooks/use-vote-toggle';


interface ScamDetailsModalProps {
    alert: any;
    onClose: () => void;
}

export default function ScamDetailsModal({ alert: initialAlert, onClose }: ScamDetailsModalProps) {
    const { user } = useAuth();
    const [alert, setAlert] = useState(initialAlert);
    const { 
        data: commentsResponse, 
        isLoading: commentsLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useScamComments(alert.id);
    
    const comments = commentsResponse?.pages?.flatMap(page => page.data || (Array.isArray(page) ? page : [])) || [];
    const createCommentMutation = useCreateComment();
    const { toggleVote, isPending: votePending } = useVoteToggle('alert');
    const [localHasVoted, setLocalHasVoted] = useState(initialAlert.hasVoted);
    const [localVoteCount, setLocalVoteCount] = useState(initialAlert._count?.votes || 0);
    const [newComment, setNewComment] = useState('');

    const updateCommentMutation = useUpdateComment();
    const deleteCommentMutation = useDeleteComment();
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
        if (!newComment.trim() || !user) return;

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
        if (!editContent.trim()) return;
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
        try {
            await deleteCommentMutation.mutateAsync({ id: commentId, scamAlertId: alert.id });
        } catch (err) {
            console.error(err);
            alert('Failed to delete comment');
        }
    };

    const handleVote = async () => {
        const isRemoving = localHasVoted;
        setLocalHasVoted(!isRemoving);
        setLocalVoteCount((prev: number) => isRemoving ? prev - 1 : prev + 1);
        
        // Ensure we pass the local state so the hook knows if it's removing or adding
        const updatedAlertState = { 
            ...alert, 
            hasVoted: isRemoving 
        };
        
        setAlert((prev: any) => ({ 
            ...prev, 
            hasVoted: !isRemoving, 
            _count: { ...prev._count, votes: prev._count?.votes + (isRemoving ? -1 : 1) } 
        }));
        
        await toggleVote(updatedAlertState);
    };

    // Prevent background scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200">
            {/* Backdrop Click */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Main Content */}
            <div
                className={cn(
                    'relative bg-card w-full shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-0 md:zoom-in-95 overflow-hidden',
                    'h-[90vh] md:h-auto md:max-h-[85vh] md:max-w-2xl md:rounded-[32px]',
                    'rounded-t-[32px] md:rounded-b-[32px] border border-white/8', // Full screen modal approach
                )}
            >
                {/* Mobile Header Drag Handle */}
                <div className="md:hidden flex justify-center py-4 absolute top-0 w-full z-20">
                    <div className="w-12 h-1.5 bg-white/15 rounded-full" />
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-white/10 transition-colors z-20 border border-white/10"
                >
                    <X size={20} className="text-white/60" />
                </button>

                <div className="flex-1 overflow-y-auto w-full min-h-0 relative">
                    {/* Hero Image (if any) */}
                    {alert.imageUrl && (
                        <div className="w-full h-48 md:h-64 relative shrink-0">
                            <img 
                                src={alert.imageUrl} 
                                alt={alert.scamName} 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                            <div className="absolute bottom-4 left-6 md:left-10">
                                <span className="bg-red-500/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 shadow-lg border border-red-400/20">
                                    <AlertTriangle size={12} />
                                    {alert.category?.name || 'Scam Alert'}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className={cn("p-6 md:p-10", !alert.imageUrl && "pt-12 md:pt-10")}>
                        {/* Title & Meta */}
                        <div className="space-y-4 mb-8">
                            {!alert.imageUrl && (
                                <span className="inline-flex bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase items-center gap-1.5 border border-red-500/20">
                                    <AlertTriangle size={12} />
                                    {alert.category?.name || 'Scam Alert'}
                                </span>
                            )}
                            
                            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-tight">
                                {alert.scamName}
                            </h2>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-white/8 pb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-white/8 rounded-lg flex items-center justify-center text-white/40">
                                        <User size={12} />
                                    </div>
                                    <span className="text-xs font-bold text-white/50 uppercase tracking-tight">
                                        {alert.user?.name || 'Local Expert'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-white/30 text-xs font-medium uppercase tracking-widest">
                                    <Calendar size={12} />
                                    {new Date(alert.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1.5 text-amber-400/80 text-xs font-bold uppercase tracking-widest">
                                    <MapPin size={12} />
                                    {alert.city?.name || 'Bangkok'}
                                </div>
                            </div>
                        </div>

                        {/* Full Description */}
                        <div className="space-y-8">
                            <div className="prose prose-invert prose-p:leading-relaxed prose-p:text-white/70 max-w-none">
                                <p className="whitespace-pre-wrap">{alert.description}</p>
                            </div>

                            {/* Prevention Tip Box */}
                            {alert.preventionTip && (
                                <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-2xl p-5 md:p-6 flex gap-4">
                                    <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                                            How to avoid this
                                        </h4>
                                        <p className="text-sm font-medium text-emerald-100/70 leading-relaxed">
                                            {alert.preventionTip}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Votes/Interactions */}
                        <div className="mt-8 py-6 border-y border-white/8">
                            <button
                                onClick={handleVote}
                                disabled={votePending}
                                className={cn(
                                    'w-full px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border shadow-sm active:scale-95 flex items-center justify-center gap-2',
                                    localHasVoted
                                        ? 'bg-red-400/10 border-red-400/30 text-red-400 shadow-red-400/10'
                                        : 'bg-white/5 border-white/10 text-foreground hover:bg-white/10 hover:border-white/20'
                                )}
                            >
                                <Heart size={14} fill={localHasVoted ? 'currentColor' : 'none'} />
                                {localHasVoted ? 'Upvoted' : 'Upvote Alert'} ({localVoteCount})
                            </button>
                            <div className="mt-4 flex items-center justify-between text-sm font-medium text-white/40">
                                <span className="flex items-center gap-1.5">
                                    <MessageSquare size={16} />
                                    {comments?.length || 0} Comments
                                </span>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="mt-8 space-y-6">
                            {/* Comment Input */}
                            {user ? (
                                <form onSubmit={handleSendComment} className="relative group">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment or share your experience..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-16 text-sm font-medium focus:outline-none focus:border-amber-400 transition-all placeholder:text-white/30 shadow-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={
                                            createCommentMutation.isPending || !newComment.trim()
                                        }
                                        className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-white/8 text-white/60 rounded-xl hover:bg-amber-400 hover:text-black transition-all active:scale-95 disabled:opacity-50 disabled:bg-white/5"
                                    >
                                        {createCommentMutation.isPending ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Send size={16} className="ml-1" />
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
                                    <p className="text-xs font-medium text-white/40 uppercase tracking-widest">
                                        Log in to join the discussion
                                    </p>
                                </div>
                            )}

                            {/* Comments List */}
                            <div className="space-y-4">
                                {commentsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2
                                            size={24}
                                            className="animate-spin text-amber-400"
                                        />
                                    </div>
                                ) : comments?.length > 0 ? (
                                    <div className="flex flex-col gap-6 pt-4">
                                        {comments.map((comment: any) => (
                                            <div
                                                key={comment.id}
                                                className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2 duration-300"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center text-white/40 shrink-0 border border-white/5">
                                                    <User size={16} />
                                                </div>
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] font-bold text-foreground uppercase tracking-tight">
                                                                {comment.user?.name || 'Local'}
                                                            </span>
                                                            <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest">
                                                                {new Date(
                                                                    comment.createdAt,
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {user?.id === comment.userId && (
                                                            <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                                                                <button onClick={() => { setEditingCommentId(comment.id); setEditContent(comment.text); }} disabled={updateCommentMutation.isPending || deleteCommentMutation.isPending} className="text-white/30 hover:text-amber-400 p-2 md:p-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-40">
                                                                    {updateCommentMutation.isPending ? (
                                                                        <Loader2 size={14} className="animate-spin" />
                                                                    ) : (
                                                                        <Edit2 size={14} className="md:hidden" />
                                                                    )}
                                                                    <Edit2 size={12} className="hidden md:block" />
                                                                </button>
                                                                <button onClick={() => handleDeleteComment(comment.id)} disabled={updateCommentMutation.isPending || deleteCommentMutation.isPending} className="text-white/30 hover:text-red-400 p-2 md:p-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-40">
                                                                    {deleteCommentMutation.isPending ? (
                                                                        <Loader2 size={14} className="animate-spin" />
                                                                    ) : (
                                                                        <Trash2 size={14} className="md:hidden" />
                                                                    )}
                                                                    <Trash2 size={12} className="hidden md:block" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {editingCommentId === comment.id ? (
                                                        <div className="mt-2 space-y-2">
                                                            <textarea 
                                                                value={editContent}
                                                                onChange={(e) => setEditContent(e.target.value)}
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 min-h-[80px] resize-none"
                                                            />
                                                            <div className="flex gap-2 justify-end mt-1">
                                                                <button onClick={() => setEditingCommentId(null)} className="text-[10px] uppercase tracking-widest px-3 py-1.5 font-bold text-white/50 hover:text-white transition-colors bg-white/5 rounded-lg">Cancel</button>
                                                                <button onClick={() => handleEditSubmit(comment.id)} disabled={updateCommentMutation.isPending} className="text-[10px] uppercase tracking-widest px-3 py-1.5 font-bold text-black bg-amber-400 hover:bg-amber-300 transition-colors rounded-lg shadow-sm">
                                                                    {updateCommentMutation.isPending ? 'Saving...' : 'Save'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-white/70 font-medium leading-relaxed">
                                                            {comment.text}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {/* Infinite Scroll Trigger */}
                                        {hasNextPage && (
                                            <div ref={ref} className="py-4 flex justify-center">
                                                {isFetchingNextPage ? (
                                                    <Loader2 size={24} className="animate-spin text-amber-400" />
                                                ) : (
                                                    <span className="text-xs text-white/30">Scroll for more...</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                            No comments yet. Start the conversation!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
