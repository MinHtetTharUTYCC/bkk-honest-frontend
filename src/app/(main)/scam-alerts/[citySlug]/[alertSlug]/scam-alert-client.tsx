"use client";

import { useParams, useRouter } from "next/navigation";
import { ScamAlertResponseDto } from "@/api/generated/model";
import { useQueryClient } from "@tanstack/react-query";
import {
  useScamAlertBySlug,
  useScamComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useDeleteScamAlert,
} from "@/hooks/use-api";
import { useVoteToggle } from "@/hooks/use-vote-toggle";
import {
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
  Flag,
  Share2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useInView } from "react-intersection-observer";
import ReactionButton from "@/components/reactions/reaction-button";
import ReportButton from "@/components/report/report-button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ImageViewer } from "@/components/ui/image-viewer";
import Image from "next/image";
import ScamEditModal from "@/components/scams/scam-edit-modal";
import { LikeButton } from "@/components/ui/like-button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AlertUser {
  id?: string;
  name?: string;
  level?: string;
  avatarUrl?: string;
  [key: string]: unknown;
}

interface AlertCity {
  name?: string;
  [key: string]: unknown;
}

interface AlertCounts {
  votes?: number;
  comments?: number;
  [key: string]: unknown;
}

interface LocalAlert {
  id: string;
  userId?: string;
  categoryId?: string;
  cityId?: string;
  city: AlertCity;
  user: AlertUser;
  scamName: string;
  slug?: string;
  description: string;
  preventionTip: string;
  createdAt: string;
  hasVoted?: boolean;
  voteId?: string | null;
  _count: AlertCounts;
  imageVariants?: {
    thumbnail: string;
    display: string;
  };
  citySlug: string;
  category: Record<string, unknown>;
}

interface AlertComment {
  id: string;
  userId?: string;
  createdAt: string;
  content?: string;
  text?: string;
  reactionCount?: number;
  userHasReacted?: boolean;
  user?: AlertUser;
}

function unwrapAlertData(payload: unknown): LocalAlert | null {
  const unwrapped =
    payload && typeof payload === "object" && "data" in payload
      ? ((payload as { data?: unknown }).data ?? payload)
      : payload;

  if (!unwrapped || typeof unwrapped !== "object") {
    return null;
  }

  const alert = unwrapped as Record<string, unknown>;
  if (typeof alert.id !== "string" || !alert.createdAt) {
    return null;
  }

  return unwrapped as LocalAlert;
}

export default function ScamAlertClient() {
  const { citySlug, alertSlug } = useParams() as {
    citySlug: string;
    alertSlug: string;
  };
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: alertResponse } = useScamAlertBySlug(
    citySlug === "thailand" ? "" : citySlug,
    alertSlug,
  );
  const alert = unwrapAlertData(alertResponse);
  const [localAlert, setLocalAlert] = useState<LocalAlert | null>(alert);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const alertId = alert?.id ?? localAlert?.id ?? "";

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
  } = useScamComments(alertId);

  const comments: AlertComment[] =
    (
      commentsResponse?.pages as unknown as Array<{ data?: AlertComment[] }>
    )?.flatMap(
      (page) =>
        page?.data ||
        (Array.isArray(page) ? (page as unknown as AlertComment[]) : []),
    ) || [];
  const createCommentMutation = useCreateComment();
  const { toggleVote, isPending: votePending } = useVoteToggle("alert");
  const [newComment, setNewComment] = useState("");

  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const deleteScamAlertMutation = useDeleteScamAlert();
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { ref, inView } = useInView();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (
      inView &&
      hasNextPage &&
      !isFetchingNextPage &&
      alertId &&
      !hasFetchedRef.current
    ) {
      hasFetchedRef.current = true;
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, alertId, fetchNextPage]);

  useEffect(() => {
    if (!inView) {
      hasFetchedRef.current = false;
    }
  }, [inView]);

  // Ensure localAlert is never null when rendering the UI
  if (!localAlert) {
    return null;
  }

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !alertId) return;

    try {
      const response = await createCommentMutation.mutateAsync({
        scamAlertId: alertId,
        content: newComment.trim(),
      });

      const newCommentData = response?.data || response;

      // Update the infinite query cache to show new comment at index 0
      queryClient.setQueryData(
        ["scam-comments", alertId],
        (oldData: { pages?: Array<{ data?: unknown[] }> } | undefined) => {
          if (!oldData || typeof oldData !== "object" || !("pages" in oldData))
            return oldData;
          const data = oldData as Record<string, unknown>;
          const oldPages = data.pages;
          if (!Array.isArray(oldPages)) return oldData;
          const newPages = [...oldPages];
          if (newPages.length === 0) {
            newPages[0] = { data: [newCommentData] };
          } else {
            const firstPage = { ...newPages[0] };
            if (typeof firstPage === "object" && firstPage !== null) {
              (firstPage as Record<string, unknown>).data = [
                newCommentData,
                ...(((firstPage as Record<string, unknown>)
                  .data as unknown[]) || []),
              ];
            }
            newPages[0] = firstPage;
          }
          return { ...data, pages: newPages };
        },
      );

      setNewComment("");
      setLocalAlert((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          _count: {
            ...prev._count,
            comments: (prev._count?.comments || 0) + 1,
          },
        };
      });
      toast.success("Comment posted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to post comment");
    }
  };

  const handleEditSubmit = async (commentId: string) => {
    if (!editContent.trim() || !alertId) return;
    try {
      const response = await updateCommentMutation.mutateAsync({
        id: commentId,
        content: editContent.trim(),
        scamAlertId: alertId,
      });

      const updatedComment = response?.data || response;

      // Update the infinite query cache
      queryClient.setQueryData(
        ["scam-comments", alertId],
        (oldData: { pages?: Array<{ data?: unknown[] }> } | undefined) => {
          if (!oldData || typeof oldData !== "object" || !("pages" in oldData))
            return oldData;
          const data = oldData as Record<string, unknown>;
          const oldPages = data.pages;
          if (!Array.isArray(oldPages)) return oldData;
          return {
            ...data,
            pages: oldPages.map((page: { data?: unknown[] } | unknown) => {
              if (typeof page !== "object" || !page) return page;
              const p = page as Record<string, unknown>;
              return {
                ...p,
                data: (p.data as unknown[])?.map((comment: unknown) => {
                  const c = comment as Record<string, unknown> & {
                    id?: string;
                  };
                  return c.id === commentId
                    ? { ...c, ...updatedComment, content: updatedComment.text }
                    : comment;
                }),
              };
            }),
          };
        },
      );

      setEditingCommentId(null);
      toast.success("Comment updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!alertId) return;
    try {
      await deleteCommentMutation.mutateAsync({
        id: commentId,
        scamAlertId: alertId,
      });

      // Update the infinite query cache
      queryClient.setQueryData(
        ["scam-comments", alertId],
        (oldData: { pages?: Array<{ data?: unknown[] }> } | undefined) => {
          if (!oldData || typeof oldData !== "object" || !("pages" in oldData))
            return oldData;
          const data = oldData as Record<string, unknown>;
          const oldPages = data.pages;
          if (!Array.isArray(oldPages)) return oldData;
          return {
            ...data,
            pages: oldPages.map((page: { data?: unknown[] } | unknown) => {
              if (typeof page !== "object" || !page) return page;
              const p = page as Record<string, unknown>;
              return {
                ...p,
                data: (p.data as unknown[])?.filter((comment: unknown) => {
                  const c = comment as Record<string, unknown> & {
                    id?: string;
                  };
                  return c.id !== commentId;
                }),
              };
            }),
          };
        },
      );

      setLocalAlert((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          _count: {
            ...prev._count,
            comments: Math.max(0, (prev._count?.comments || 0) - 1),
          },
        };
      });

      setCommentToDelete(null);
      toast.success("Comment deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete comment");
    }
  };

  const handleVoteToggle = async () => {
    if (!user) {
      import("sonner").then((m) =>
        m.toast.error("Please join us first to like this!"),
      );
      return;
    }
    if (!localAlert) return;

    const wasVoted = Boolean(localAlert.hasVoted);

    setLocalAlert((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        hasVoted: !wasVoted,
        voteId: wasVoted ? null : "temp-id",
        _count: {
          ...prev._count,
          votes: Math.max(0, (prev._count?.votes || 0) + (wasVoted ? -1 : 1)),
        },
      };
    });

    const result = await toggleVote(localAlert as ScamAlertResponseDto);

    setLocalAlert((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        hasVoted: Boolean(result.voteId),
        voteId: result.voteId,
      };
    });
  };

  const handleDeleteAlert = async () => {
    if (!alertId) return;
    try {
      await deleteScamAlertMutation.mutateAsync(alertId);
      toast.success("Scam alert deleted");
      router.push("/scam-alerts");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete alert");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Delete Scam Alert Confirmation */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scam Alert?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this scam alert? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteScamAlertMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAlert();
              }}
              disabled={deleteScamAlertMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteScamAlertMutation.isPending
                ? "Deleting..."
                : "Delete Alert"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Comment Confirmation */}
      <AlertDialog
        open={!!commentToDelete}
        onOpenChange={(open) => !open && setCommentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCommentMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (commentToDelete) handleDeleteComment(commentToDelete);
              }}
              disabled={deleteCommentMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteCommentMutation.isPending
                ? "Deleting..."
                : "Delete Comment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content - Now using native page scroll */}
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6 overflow-hidden">
        {/* Header inside ScrollArea */}
        <div className="flex items-center gap-4 mb-2 w-full">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-display font-bold text-foreground line-clamp-2 break-all flex-1 min-w-0">
            {localAlert.scamName}
          </h1>
        </div>

        {/* Hero Image */}
        {localAlert.imageVariants &&
          Object.values(localAlert.imageVariants).some((v) => v) && (
            <div
              className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl cursor-pointer group"
              onClick={() => setShowImageViewer(true)}
            >
              <Image
                src={
                  localAlert.imageVariants.display ||
                  localAlert.imageVariants.thumbnail ||
                  ""
                }
                alt={localAlert.scamName || "Scam alert image"}
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
              {/* AlertTriangle icon removed as requested */}
              <div className="space-y-1">
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
                      {new Date(localAlert.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {user && (
                <DropdownMenu
                  trigger={
                    <button className="p-2.5 hover:bg-white/10 rounded-xl text-white transition-colors bg-white/5 border border-white/10 shadow-sm">
                      <MoreVertical size={20} />
                    </button>
                  }
                >
                  {/* Share and Report moved into menu */}
                  <DropdownMenuItem
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: localAlert.scamName,
                          text: `Watch out for the ${localAlert.scamName} scam in ${localAlert.city?.name || "Thailand"}! ⚠️`,
                          url: window.location.href,
                        });
                      }
                    }}
                    className="gap-3 py-3"
                  >
                    <Share2 size={16} className="text-amber-400" />
                    <span className="text-sm font-medium">Share Alert</span>
                  </DropdownMenuItem>

                  {user.id === localAlert.userId ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => setIsEditModalOpen(true)}
                        className="gap-3 py-3"
                      >
                        <Edit2 size={16} />
                        <span className="text-sm font-medium">Edit Alert</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setIsDeleteAlertOpen(true)}
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
                        className="w-full flex items-center justify-start gap-3 px-4 py-3 text-sm font-medium hover:bg-white/5 transition-colors border-none text-white/70 hover:text-white"
                      >
                        <Flag size={16} />
                        <span>Report Alert</span>
                      </ReportButton>
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
            <div
              className="flex items-center gap-3 cursor-pointer group/user"
              onClick={() =>
                router.push(
                  `/profile/${localAlert.userId || localAlert.user?.id}`,
                )
              }
            >
              <div className="relative w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/60 overflow-hidden border border-white/10 group-hover/user:border-amber-400 transition-colors">
                {localAlert.user?.avatarUrl ? (
                  <Image
                    src={localAlert.user.avatarUrl}
                    alt={localAlert.user?.name || "User Avatar"}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <User size={18} />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white uppercase tracking-tight group-hover/user:text-amber-400 transition-colors">
                  {localAlert.user?.name || "Local Expert"}
                </span>
                {localAlert.user?.level && (
                  <span className="text-[8px] font-bold text-amber-400 uppercase tracking-tighter">
                    {localAlert.user.level.replace("_", " ")}
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
                className="text-[11px] font-black uppercase tracking-widest gap-2 px-6 py-2.5 rounded-xl border border-white/10 shadow-sm w-full justify-center bg-white/5 hover:border-amber-400/20"
                title={
                  localAlert.hasVoted ? "Remove upvote" : "Upvote this alert"
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
              <Textarea
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
                No one&apos;s talking yet.
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-5 bg-white/5 border border-white/8 rounded-2xl space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="flex items-center gap-3 cursor-pointer group/comment-user"
                      onClick={() =>
                        router.push(
                          `/profile/${comment.userId || comment.user?.id}`,
                        )
                      }
                    >
                      <div className="relative w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/40 overflow-hidden border border-white/5 group-hover/comment-user:border-amber-400 transition-colors">
                        {comment.user?.avatarUrl ? (
                          <Image
                            src={comment.user.avatarUrl}
                            alt={comment.user?.name || "User Avatar"}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        ) : (
                          <User size={14} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white uppercase tracking-tight group-hover/comment-user:text-amber-400 transition-colors">
                            {comment.user?.name || "Local"}
                          </span>
                          {comment.user?.level && (
                            <span className="text-[7px] font-bold text-amber-400/60 border border-amber-400/10 px-1 py-0.5 rounded uppercase tracking-tighter">
                              {comment.user.level.replace("_", " ")}
                            </span>
                          )}
                        </div>
                        <span className="text-[12px] font-medium text-white/50 uppercase tracking-widest">
                          {new Date(comment.createdAt).toLocaleDateString()}
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
                              setEditContent(comment.content ?? "");
                            }}
                            className="gap-2 py-3"
                          >
                            <Edit2 size={14} />
                            <span className="text-sm font-medium">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setCommentToDelete(comment.id)}
                            className="gap-2 py-3"
                            danger
                          >
                            <Trash2 size={14} />
                            <span className="text-sm font-medium">Delete</span>
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuItem asChild>
                        <ReportButton
                          targetId={comment.id}
                          reportType="COMMENT"
                          className="w-full flex items-center justify-start gap-3 px-4 py-3 text-sm font-medium hover:bg-white/5 transition-colors border-none text-white/70 hover:text-white"
                        >
                          <Flag size={16} />
                          <span>Report Comment</span>
                        </ReportButton>
                      </DropdownMenuItem>
                    </DropdownMenu>
                  </div>

                  {editingCommentId === comment.id ? (
                    <div className="space-y-3">
                      <Textarea
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
                        {comment.content || comment.text}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <ReactionButton
                          commentId={comment.id}
                          initialCount={comment.reactionCount || 0}
                          initialUserReacted={comment.userHasReacted || false}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Load more trigger */}
            <div
              ref={ref}
              className="flex justify-center py-10 min-h-[100px] items-start"
            >
              {isFetchingNextPage ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-amber-400" size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                    Loading...
                  </span>
                </div>
              ) : hasNextPage ? (
                <span className="text-[12px] font-black uppercase tracking-widest text-white/50 animate-pulse">
                  Scroll for more
                </span>
              ) : comments.length > 10 ? (
                <div className="flex flex-col items-center gap-2 opacity-50">
                  <ShieldCheck size={20} className="text-emerald-500/50" />
                  <span className="text-[12px] font-black uppercase tracking-widest">
                    End of conversation
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <ScamEditModal
          alert={localAlert}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Image Viewer */}
      {localAlert.imageVariants &&
        Object.values(localAlert.imageVariants).some((v) => v) && (
          <ImageViewer
            isOpen={showImageViewer}
            imageVariants={localAlert.imageVariants}
            alt={localAlert.scamName}
            onClose={() => setShowImageViewer(false)}
          />
        )}
    </div>
  );
}
