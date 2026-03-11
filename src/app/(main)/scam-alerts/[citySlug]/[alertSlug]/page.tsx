'use client';

import { useParams, useRouter } from 'next/navigation';
import { useScamAlertBySlug, useScamComments, useCreateComment, useUpdateComment, useDeleteComment } from '@/hooks/use-api';
import { useVoteToggle } from '@/hooks/use-vote-toggle';
import {
    X,
    AlertTriangle,
    MessageSquare,
    Edit2,
    Trash2,
    Send,
    Loader2,
    Heart,
    User,
    Calendar,
    ShieldCheck,
    MapPin,
    ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useInView } from 'react-intersection-observer';
import ReactionButton from '@/components/reactions/reaction-button';
import ReportButton from '@/components/report/report-button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ScamAlertDetailPage() {
    const { citySlug, alertSlug } = useParams() as { citySlug: string; alertSlug: string };
    const { user } = useAuth();
    const router = useRouter();
    const { data: alert, isLoading: alertLoading } = useScamAlertBySlug(citySlug, alertSlug);
    const [localAlert, setLocalAlert] = useState<any>(alert);

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

    const comments = commentsResponse?.pages?.flatMap((page) => page.data || (Array.isArray(page) ? page : [])) || [];
    const createCommentMutation = useCreateComment();
    const { toggleVote, isPending: votePending } = useVoteToggle('alert');
    const [localHasVoted, setLocalHasVoted] = useState(alert?.hasVoted || false);
    const [localVoteCount, setLocalVoteCount] = useState(alert?._count?.votes || 0);
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
        if (!user || !alert) return;
        setLocalHasVoted(!localHasVoted);
        setLocalVoteCount(localHasVoted ? localVoteCount - 1 : localVoteCount + 1);

        try {
            await toggleVote(alert.id);
        } catch (err) {
            setLocalHasVoted(!localHasVoted);
            setLocalVoteCount(localHasVoted ? localVoteCount + 1 : localVoteCount - 1);
        }
    };

    if (alertLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    if (!alert) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <AlertTriangle size={48} className="text-destructive" />
                <h1 className="text-2xl font-bold">Scam Alert Not Found</h1>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-blue-500 hover:underline"
                >
                    <ArrowLeft size={20} /> Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
                <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-muted rounded-lg"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-bold flex-1 text-center px-4 line-clamp-1">
                        {localAlert.scamName}
                    </h1>
                    <div className="w-10" />
                </div>
            </div>

            {/* Main Content */}
            <ScrollArea className="h-[calc(100vh-80px)]">
                <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
                    {/* Alert Header */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-2 bg-destructive/10 rounded-lg">
                                    <AlertTriangle size={24} className="text-destructive" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">{localAlert.scamName}</h1>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                        {localAlert.city?.name && (
                                            <>
                                                <MapPin size={16} />
                                                <span>{localAlert.city.name}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {user && <ReportButton targetId={localAlert.id} reportType="SCAM_ALERT" />}
                            </div>
                        </div>

                        {/* Description */}
                        {localAlert.description && (
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-foreground">{localAlert.description}</p>
                            </div>
                        )}

                        {/* Meta Info */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {localAlert.category && (
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <span className="text-muted-foreground">Category</span>
                                    <p className="font-medium">{localAlert.category.name}</p>
                                </div>
                            )}
                            {localAlert.createdAt && (
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <span className="text-muted-foreground">Reported</span>
                                    <p className="font-medium">
                                        {new Date(localAlert.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Vote & Reaction */}
                        {user && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleVoteToggle}
                                    disabled={votePending}
                                    className={cn(
                                        'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                                        localHasVoted
                                            ? 'bg-destructive text-destructive-foreground'
                                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                    )}
                                >
                                    <Heart size={18} fill={localHasVoted ? 'currentColor' : 'none'} />
                                    <span>{localVoteCount}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="border-t" />

                    {/* Comments Section */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <MessageSquare size={20} />
                            Comments ({comments.length})
                        </h2>

                        {/* Comment Input */}
                        {user ? (
                            <form onSubmit={handleSendComment} className="flex gap-2">
                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-muted rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || createCommentMutation.isPending}
                                        className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
                                <p>Sign in to comment</p>
                            </div>
                        )}

                        {/* Comments List */}
                        <div className="space-y-3">
                            {commentsLoading && comments.length === 0 ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin" size={24} />
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No comments yet. Be the first!
                                </div>
                            ) : (
                                comments.map((comment: any) => (
                                    <div key={comment.id} className="p-4 bg-muted/50 rounded-lg space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-muted-foreground" />
                                                <span className="font-medium text-sm">
                                                    {comment.user?.name || 'Anonymous'}
                                                </span>
                                                {comment.user?.id === localAlert.userId && (
                                                    <ShieldCheck size={14} className="text-blue-500" />
                                                )}
                                            </div>
                                            {user?.id === comment.userId && (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => {
                                                            setEditingCommentId(comment.id);
                                                            setEditContent(comment.content);
                                                        }}
                                                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {editingCommentId === comment.id ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    className="flex-1 px-2 py-1 bg-background border border-muted rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                                <button
                                                    onClick={() => handleEditSubmit(comment.id)}
                                                    disabled={updateCommentMutation.isPending}
                                                    className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 disabled:opacity-50"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingCommentId(null)}
                                                    className="px-2 py-1 bg-muted rounded text-sm hover:bg-muted/80"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-foreground">{comment.content}</p>
                                        )}

                                        <div className="text-xs text-muted-foreground">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Load more trigger */}
                            <div ref={ref} className="flex justify-center py-4">
                                {isFetchingNextPage && <Loader2 className="animate-spin" size={20} />}
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
