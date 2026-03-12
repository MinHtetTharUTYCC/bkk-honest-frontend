'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { X, MessageSquare, Send, Loader2, User, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTipComments, useCreateComment, useUpdateComment, useDeleteComment } from '@/hooks/use-api';
import { useAuth } from '@/components/providers/auth-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReportButton from '@/components/report/report-button';
import ReactionButton from '@/components/reactions/reaction-button';

interface TipCommentsModalProps {
  tip: any;
  onClose: () => void;
}

export default function TipCommentsModal({ tip, onClose }: TipCommentsModalProps) {
  const { user } = useAuth();
  const { 
    data: commentsResponse, 
    isLoading: commentsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useTipComments(tip.id);

  const comments = commentsResponse?.pages?.flatMap(page => page.data || (Array.isArray(page) ? page : [])) || [];
  
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const [newComment, setNewComment] = useState('');
  
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
        communityTipId: tip.id,
        content: newComment.trim()
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
        communityTipId: tip.id,
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
      await deleteCommentMutation.mutateAsync({ id: commentId, communityTipId: tip.id });
    } catch (err) {
      console.error(err);
      alert('Failed to delete comment');
    }
  };

  // Prevent background scroll
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4"
    >
      <div className="absolute inset-0" onClick={(e) => { e.stopPropagation(); onClose(); }} onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} />

      <div 
        className={cn(
          "relative bg-background w-full shadow-2xl border border-border flex flex-col transition-all duration-300 animate-in overscroll-contain",
          "h-[80vh] md:h-auto md:max-h-[85vh] md:max-w-lg md:rounded-[24px]",
          "rounded-t-[24px] md:rounded-b-[24px]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden flex justify-center py-4">
          <div className="w-12 h-1.5 bg-white/10 rounded-full" />
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }} onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
          className="hidden md:flex absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors z-10"
        >
          <X size={20} className="text-white/50" />
        </button>

        <div className="px-6 py-4 md:px-8 md:pt-8 md:pb-6 border-b border-border flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3 text-white">
            <MessageSquare size={20} className={tip.type === 'AVOID' ? 'text-red-400' : 'text-emerald-400'} />
            <div className="flex flex-col pr-8">
              <h3 className="text-xl font-display font-bold line-clamp-1">Comments</h3>
              <p className="text-[10px] font-semibold text-white/50 tracking-wide line-clamp-1">{tip.title}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
          <div className="p-6 md:p-8 space-y-8">
            <div className="space-y-6">
              {user ? (
                <form onSubmit={handleSendComment} className="relative group">
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full bg-black/20 border border-border rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-amber-400 transition-all placeholder:text-white/30"
                  />
                  <button 
                    type="submit"
                    disabled={createCommentMutation.isPending || !newComment.trim()}
                    className="absolute right-2 top-2 p-1.5 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50 disabled:bg-white/10 disabled:text-white/30"
                  >
                    {createCommentMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </form>
              ) : (
                <div className="bg-white/5 border border-border rounded-xl p-4 text-center">
                  <p className="text-xs font-semibold text-white/50 tracking-wide">Log in to join the discussion</p>
                </div>
              )}

              <div className="space-y-4">
                {commentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-amber-400" />
                  </div>
                ) : comments?.length > 0 ? (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3 items-start group">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-border flex items-center justify-center text-white/40 shrink-0 mt-1 overflow-hidden">
                         {comment.user?.avatarUrl ? (
                            <img src={comment.user.avatarUrl} className="w-full h-full object-cover" />
                          ) : (
                            <User size={16} />
                          )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white/80">
                              {comment.user?.name || 'Local'}
                            </span>
                            {comment.user?.level && (
                               <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white/60">
                                Lvl {comment.user.level === 'LOCAL_GURU' ? '3' : comment.user.level === 'EXPLORER' ? '2' : '1'}
                               </span>
                            )}
                            <span className="text-[10px] font-medium text-white/40">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {user?.id === comment.userId && (
                             <div className="flex items-center gap-2">
                               <button onClick={() => { setEditingCommentId(comment.id); setEditContent(comment.text); }} className="text-white/40 hover:text-amber-400 p-1"><Edit2 size={18} /></button>
                               <button onClick={() => handleDeleteComment(comment.id)} className="text-white/40 hover:text-red-400 p-1"><Trash2 size={18} /></button>
                             </div>
                          )}
                        </div>
                        
                        {editingCommentId === comment.id ? (
                           <div className="mt-2 space-y-2">
                             <input 
                               type="text" 
                               value={editContent}
                               onChange={(e) => setEditContent(e.target.value)}
                               className="w-full bg-black/40 border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                             />
                             <div className="flex gap-2 justify-end mt-1">
                               <button onClick={() => setEditingCommentId(null)} className="text-xs px-2 py-1 font-semibold text-white/50 hover:text-white transition-colors">Cancel</button>
                               <button onClick={() => handleEditSubmit(comment.id)} disabled={updateCommentMutation.isPending} className="text-xs px-2 py-1 font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                                 {updateCommentMutation.isPending ? 'Saving...' : 'Save'}
                               </button>
                             </div>
                           </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="bg-white/5 border border-border rounded-xl rounded-tl-none p-3">
                              <p className="text-xs text-white/80 leading-relaxed">
                                {comment.text}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 px-3">
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
                  ))
                ) : (
                  <div className="py-12 text-center bg-black/20 rounded-2xl border border-dashed border-border">
                    <p className="text-xs font-semibold text-white/40 tracking-wide">No comments yet. Start the conversation!</p>
                  </div>
                )}

                {/* Infinite Scroll Trigger */}
                {hasNextPage && (
                  <div ref={ref} className="py-4 flex justify-center">
                    {isFetchingNextPage ? (
                      <Loader2 size={24} className="animate-spin text-amber-400" />
                    ) : (
                      <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Scroll for more</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden p-4 border-t border-border bg-background/80 backdrop-blur-md">
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }} onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
            className="w-full py-3 rounded-xl bg-white/10 text-white font-bold text-xs active:scale-95 transition-all"
          >
            Close Comments
          </button>
        </div>
      </div>
    </div>
  );
}
