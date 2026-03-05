'use client';

import { useState, useEffect } from 'react';
import {
    X,
    AlertTriangle,
    MessageSquare,
    Send,
    Loader2,
    Heart,
    User,
    Calendar,
    ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScamComments, useCreateComment } from '@/hooks/use-api';
import { useAuth } from '@/components/providers/auth-provider';
import { useVoteToggle } from '@/hooks/use-vote-toggle';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScamDetailsModalProps {
    alert: any;
    onClose: () => void;
}

export default function ScamDetailsModal({ alert: initialAlert, onClose }: ScamDetailsModalProps) {
    const { user } = useAuth();
    const [alert, setAlert] = useState(initialAlert);
    const { data: comments, isLoading: commentsLoading } = useScamComments(alert.id);
    const createCommentMutation = useCreateComment();
    const { toggleVote, isPending: votePending } = useVoteToggle('alert');
    const [newComment, setNewComment] = useState('');

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

    const handleVote = async () => {
        const result = await toggleVote(alert);
        // Since toggleVote handles optimistic updates or returns updated data, we should sync if needed
        // In our case toggleVote might not return data, so we rely on parent/query invalidation
    };

    // Prevent background scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
            {/* Backdrop Click */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Main Content */}
            <div
                className={cn(
                    'relative bg-white w-full shadow-2xl overflow-hidden flex flex-col transition-all duration-300 animate-in',
                    'h-[80vh] md:h-auto md:max-h-[85vh] md:max-w-lg md:rounded-[40px]',
                    'rounded-t-[40px] md:rounded-b-[40px]', // Drawer style for mobile
                )}
            >
                {/* Mobile Header Drag Handle */}
                <div className="md:hidden flex justify-center py-4">
                    <div className="w-12 h-1.5 bg-white/15 rounded-full" />
                </div>

                {/* Close Button (Desktop) */}
                <button
                    onClick={onClose}
                    className="hidden md:flex absolute top-6 right-6 p-2 rounded-full hover:bg-white/8 transition-colors z-10"
                >
                    <X size={20} className="text-white/40" />
                </button>

                {/* Header */}
                <div className="px-6 py-4 md:px-10 md:pt-10 md:pb-6 border-b border-white/8 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-foreground">
                        <MessageSquare size={20} className="text-amber-400" />
                        <div className="flex flex-col">
                            <h3 className="font-display text-xl font-bold tracking-tight line-clamp-1">
                                Comments
                            </h3>
                            <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest line-clamp-1">
                                {alert.scamName}
                            </p>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest whitespace-nowrap ml-4">
                        {comments?.length || 0} Comments
                    </span>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-6 md:p-10 space-y-8">
                        {/* Comments Section */}
                        <div className="space-y-6">
                            {/* Comment Input */}
                            {user ? (
                                <form onSubmit={handleSendComment} className="relative group">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment or share your experience..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-16 text-sm font-medium focus:outline-none focus:border-amber-400 transition-all placeholder:text-white/30 shadow-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={
                                            createCommentMutation.isPending || !newComment.trim()
                                        }
                                        className="absolute right-3 top-3 p-2 bg-white/8 text-white/60 rounded-xl hover:bg-amber-400 hover:text-black transition-all active:scale-95 disabled:opacity-50 disabled:bg-white/5"
                                    >
                                        {createCommentMutation.isPending ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Send size={16} />
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="bg-white/5 rounded-2xl p-4 text-center">
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
                                    comments.map((comment: any) => (
                                        <div
                                            key={comment.id}
                                            className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center text-white/40 shrink-0 mt-1">
                                                <User size={14} />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-foreground uppercase tracking-tight">
                                                        {comment.user?.name || 'Local'}
                                                    </span>
                                                    <span className="text-[8px] font-medium text-white/30 uppercase tracking-widest">
                                                        {new Date(
                                                            comment.createdAt,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="bg-white/5 rounded-2xl rounded-tl-none p-4">
                                                    <p className="text-sm text-white/60 font-medium leading-relaxed">
                                                        {comment.text}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center bg-white/5 rounded-3xl border-2 border-dashed border-white/8">
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                            No comments yet. Start the conversation!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* Action Bar (Mobile only) */}
                <div className="md:hidden p-4 border-t border-white/8 bg-background/90 backdrop-blur-md">
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl bg-white/8 text-foreground font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all border border-white/10"
                    >
                        Close Comments
                    </button>
                </div>
            </div>
        </div>
    );
}
