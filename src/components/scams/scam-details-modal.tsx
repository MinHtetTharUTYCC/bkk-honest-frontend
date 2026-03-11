'use client';

import { useState, useEffect, useRef } from 'react';
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
    MoreVertical,
    Flag,
    Camera,
    Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScamComments, useCreateComment, useUpdateComment, useDeleteComment, useUpdateScamAlert, useDeleteScamAlert, useCategories, useCities } from '@/hooks/use-api';
import { useAuth } from '@/components/providers/auth-provider';
import { useVoteToggle } from '@/hooks/use-vote-toggle';
import ReactionButton from '@/components/reactions/reaction-button';
import ReportButton from '@/components/report/report-button';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';

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

    const updateScamMutation = useUpdateScamAlert();
    const deleteScamMutation = useDeleteScamAlert();
    const { data: categories } = useCategories();
    const { data: cities } = useCities();

    const isOwner = user?.id === alert.userId || user?.id === alert.user?.id;
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(alert.scamName);
    const [editDesc, setEditDesc] = useState(alert.description);
    const [editPrev, setEditPrev] = useState(alert.preventionTip);
    const [editCategory, setEditCategory] = useState(alert.categoryId);
    const [editCity, setEditCity] = useState(alert.cityId);
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editPreview, setEditPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleUpdate = async () => {
        try {
            const result = await updateScamMutation.mutateAsync({
                id: alert.id,
                payload: {
                    scamName: editName,
                    description: editDesc,
                    preventionTip: editPrev,
                    categoryId: editCategory,
                    cityId: editCity,
                    image: editFile || undefined,
                },
            });
            setAlert(result.data || result);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert('Failed to update scam alert');
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this scam alert?')) {
            try {
                await deleteScamMutation.mutateAsync(alert.id);
                onClose();
            } catch (err) {
                console.error(err);
                alert('Failed to delete scam alert');
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditFile(file);
            setEditPreview(URL.createObjectURL(file));
        }
    };

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
            <div className="absolute inset-0" onClick={(e) => { e.stopPropagation(); onClose(); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} />

            {/* Main Content */}
            <div
                className={cn(
                    'relative bg-card w-full shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-0 md:zoom-in-95 overflow-hidden',
                    'h-[90vh] md:h-auto md:max-h-[85vh] md:max-w-2xl md:rounded-[32px]',
                    'rounded-t-[32px] md:rounded-b-[32px] border border-white/8',
                )}
            >
                {/* Mobile Header Drag Handle */}
                <div className="md:hidden flex justify-center py-4 absolute top-0 w-full z-20">
                    <div className="w-12 h-1.5 bg-white/15 rounded-full" />
                </div>

                {/* Close & Action Buttons */}
                <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 z-20">
                    <DropdownMenu
                        trigger={
                            <button className="p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-white/10 transition-colors border border-white/10 text-white/60 shadow-xl active:scale-95 transition-transform">
                                <MoreVertical size={20} />
                            </button>
                        }
                    >
                        {isOwner && (
                            <>
                                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                    <Edit2 size={16} />
                                    <span>Edit Alert</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDelete} danger>
                                    {deleteScamMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    <span>Delete Alert</span>
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuItem asChild>
                            <ReportButton targetId={alert.id} reportType="SCAM_ALERT">
                                <div className="w-full flex items-center gap-2">
                                    <Flag size={16} />
                                    <span>Report Alert</span>
                                </div>
                            </ReportButton>
                        </DropdownMenuItem>
                    </DropdownMenu>

                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                        className="p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-white/10 transition-colors border border-white/10 text-white/60"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto w-full min-h-0 relative">
                    {isEditing ? (
                        <div className="p-6 md:p-10 space-y-6">
                            <h3 className="font-display text-2xl font-bold text-foreground uppercase tracking-tight">
                                Edit Alert
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-32 h-32 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 transition-colors shrink-0 overflow-hidden relative group"
                                    >
                                        {editPreview || alert.imageUrl ? (
                                            <img
                                                src={editPreview || alert.imageUrl}
                                                className="w-full h-full object-cover group-hover:opacity-50"
                                            />
                                        ) : (
                                            <Camera size={24} className="text-white/20" />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={20} className="text-amber-400" />
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />

                                    <div className="flex-1 space-y-3">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base font-semibold text-foreground focus:outline-none focus:border-amber-400 transition-all"
                                            placeholder="Scam name"
                                        />
                                        <div className="flex gap-2">
                                            <select
                                                value={editCategory}
                                                onChange={(e) => setEditCategory(e.target.value)}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground focus:outline-none focus:border-amber-400 transition-all"
                                            >
                                                {categories?.map((cat: any) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                value={editCity}
                                                onChange={(e) => setEditCity(e.target.value)}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground focus:outline-none focus:border-amber-400 transition-all"
                                            >
                                                {cities?.map((city: any) => (
                                                    <option key={city.id} value={city.id}>
                                                        {city.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <textarea
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-foreground/70 focus:outline-none focus:border-amber-400 transition-all min-h-[120px] resize-none"
                                    placeholder="Scam description"
                                />

                                <input
                                    type="text"
                                    value={editPrev}
                                    onChange={(e) => setEditPrev(e.target.value)}
                                    className="w-full bg-emerald-400/8 border border-emerald-400/15 rounded-xl px-4 py-3 text-sm font-medium text-emerald-400 focus:outline-none focus:border-emerald-400 transition-all"
                                    placeholder="Prevention tip"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-4 bg-white/8 text-white/50 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-white/12 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={updateScamMutation.isPending}
                                    className="flex-[2] py-4 bg-amber-400 text-black rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-amber-300 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20"
                                >
                                    {updateScamMutation.isPending ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
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
                                            <div className="w-6 h-6 bg-white/8 rounded-lg flex items-center justify-center text-white/40 overflow-hidden shrink-0 border border-white/5">
                                                {alert.user?.avatarUrl ? (
                                                    <img src={alert.user.avatarUrl} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={12} />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-white/50 uppercase tracking-tight">
                                                    {alert.user?.name || 'Local Expert'}
                                                </span>
                                                {alert.user?.level && (
                                                    <span className="text-[8px] font-bold text-amber-400 border border-amber-400/20 bg-amber-400/5 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                        {alert.user.level.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-white/30 text-xs font-medium uppercase tracking-widest">
                                            <Calendar size={12} />
                                            {new Date(alert.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-amber-400/80 text-xs font-bold uppercase tracking-widest">
                                            <MapPin size={12} />
                                            {alert.city?.name}
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
                                <div className="mt-8 py-6 border-y border-white/8 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 shadow-sm">
                                        <MessageSquare size={14} className="text-amber-400" />
                                        <span className="text-xs font-bold uppercase tracking-tight">
                                            {comments?.length || 0}
                                        </span>
                                        <span className="text-[10px] font-medium text-white/20 uppercase tracking-widest ml-1 hidden sm:inline">
                                            Comments
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleVote}
                                        disabled={votePending}
                                        className={cn(
                                            'px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border shadow-sm active:scale-95 flex items-center justify-center gap-2 min-w-[140px]',
                                            localHasVoted
                                                ? 'bg-amber-400/10 border-amber-400/20 text-amber-400 shadow-amber-400/5'
                                                : 'bg-white/5 border-white/10 text-white/40 hover:text-amber-400 hover:border-amber-400/20'
                                        )}
                                    >
                                        <Heart size={14} fill={localHasVoted ? 'currentColor' : 'none'} />
                                        {localVoteCount}
                                        <span className="ml-1 hidden sm:inline">{localHasVoted ? 'Upvoted' : 'Upvote'}</span>
                                    </button>
                                </div>

                                {/* Comments Section */}
                                <div className="mt-8 space-y-6">
                                    {/* Comment Input */}
                                    {user ? (
                                        <form onSubmit={handleSendComment} className="relative group">
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendComment(e);
                                                    }
                                                }}
                                                placeholder="Add a comment or share your experience..."
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-16 text-sm font-medium focus:outline-none focus:border-amber-400 transition-all placeholder:text-white/30 shadow-sm min-h-[100px] resize-none"
                                            />
                                            <button
                                                type="submit"
                                                disabled={
                                                    createCommentMutation.isPending || !newComment.trim()
                                                }
                                                className="absolute right-3 bottom-3 w-10 h-10 flex items-center justify-center bg-white/8 text-white/60 rounded-xl hover:bg-amber-400 hover:text-black transition-all active:scale-95 disabled:opacity-50 disabled:bg-white/5"
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
                                                        <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center text-white/40 shrink-0 border border-white/5 overflow-hidden">
                                                            {comment.user?.avatarUrl ? (
                                                                <img src={comment.user.avatarUrl} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User size={16} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 space-y-1.5">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[11px] font-bold text-foreground uppercase tracking-tight">
                                                                        {comment.user?.name || 'Local'}
                                                                    </span>
                                                                    {comment.user?.level && (
                                                                        <span className="text-[7px] font-bold text-amber-400/60 border border-amber-400/10 px-1 py-0.5 rounded uppercase tracking-tighter">
                                                                            {comment.user.level.replace('_', ' ')}
                                                                        </span>
                                                                    )}
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
                                                                <div className="space-y-2">
                                                                    <p className="text-sm text-white/70 font-medium leading-relaxed whitespace-pre-wrap">
                                                                        {comment.text}
                                                                    </p>
                                                                    <div className="flex items-center gap-2">
                                                                        <ReactionButton 
                                                                            commentId={comment.id}
                                                                            initialCount={comment.reactionCount || 0}
                                                                            initialUserReacted={comment.userHasReacted || false}
                                                                        />
                                                                        <ReportButton 
                                                                            targetId={comment.id}
                                                                            reportType="COMMENT"
                                                                            size="sm"
                                                                        />
                                                                    </div>
                                                                </div>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
