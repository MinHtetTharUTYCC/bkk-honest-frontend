"use client";

import {
  useCommentsControllerFindByTipInfinite,
  useCommentsControllerFindByScamAlertInfinite,
  useCommentsControllerCreate,
  useCommentsControllerUpdate,
  useCommentsControllerDelete,
} from "@/api/generated/comments/comments";
import {
  useCommentReactionsControllerToggleReaction,
  useCommentReactionsControllerGetReactionSummary,
} from "@/api/generated/comment-reactions/comment-reactions";
import type { CreateCommentDto } from "@/api/generated/model";
import { getNextSkipFromPage } from "./base";

export function useTipComments(tipId: string) {
  return useCommentsControllerFindByTipInfinite(
    tipId,
    {
      take: 10,
    },
    {
      query: {
        queryKey: ["tip-comments", tipId],
        getNextPageParam: (lastPage: unknown) =>
          getNextSkipFromPage(lastPage, true),
        enabled: !!tipId,
      },
    },
  );
}

export function useScamComments(scamAlertId: string) {
  return useCommentsControllerFindByScamAlertInfinite(
    scamAlertId,
    {
      take: 10,
    },
    {
      query: {
        queryKey: ["scam-comments", scamAlertId],
        getNextPageParam: (lastPage: unknown) =>
          getNextSkipFromPage(lastPage, true),
        enabled: !!scamAlertId,
      },
    },
  );
}

export function useCreateComment() {
  const mutation = useCommentsControllerCreate();
  return {
    ...mutation,
    mutate: (payload: {
      scamAlertId?: string;
      communityTipId?: string;
      content: string;
    }) => {
      const apiPayload: CreateCommentDto = {
        text: payload.content,
        targetType: "COMMUNITY_TIP",
      };
      if (payload.scamAlertId) {
        apiPayload.targetType = "SCAM_ALERT";
        apiPayload.scamAlertId = payload.scamAlertId;
      } else if (payload.communityTipId) {
        apiPayload.targetType = "COMMUNITY_TIP";
        apiPayload.communityTipId = payload.communityTipId;
      }
      return mutation.mutate({ data: apiPayload });
    },
    mutateAsync: async (payload: {
      scamAlertId?: string;
      communityTipId?: string;
      content: string;
    }) => {
      const apiPayload: CreateCommentDto = {
        text: payload.content,
        targetType: "COMMUNITY_TIP",
      };
      if (payload.scamAlertId) {
        apiPayload.targetType = "SCAM_ALERT";
        apiPayload.scamAlertId = payload.scamAlertId;
      } else if (payload.communityTipId) {
        apiPayload.targetType = "COMMUNITY_TIP";
        apiPayload.communityTipId = payload.communityTipId;
      }
      return mutation.mutateAsync({ data: apiPayload });
    },
  };
}

export function useUpdateComment() {
  const mutation = useCommentsControllerUpdate();
  return {
    ...mutation,
    mutate: (payload: {
      id: string;
      content: string;
      scamAlertId?: string;
      communityTipId?: string;
    }) => mutation.mutate({ id: payload.id, data: { text: payload.content } }),
    mutateAsync: (payload: {
      id: string;
      content: string;
      scamAlertId?: string;
      communityTipId?: string;
    }) =>
      mutation.mutateAsync({ id: payload.id, data: { text: payload.content } }),
  };
}

export function useDeleteComment() {
  const mutation = useCommentsControllerDelete();
  return {
    ...mutation,
    mutate: (payload: {
      id: string;
      scamAlertId?: string;
      communityTipId?: string;
    }) => mutation.mutate({ id: payload.id }),
    mutateAsync: (payload: {
      id: string;
      scamAlertId?: string;
      communityTipId?: string;
    }) => mutation.mutateAsync({ id: payload.id }),
  };
}

export function useToggleCommentReaction() {
  const mutation = useCommentReactionsControllerToggleReaction();
  return {
    ...mutation,
    mutate: (commentId: string) => mutation.mutate({ commentId }),
    mutateAsync: (commentId: string) => mutation.mutateAsync({ commentId }),
  };
}

export function useGetCommentReaction(commentId: string) {
  const query = useCommentReactionsControllerGetReactionSummary(commentId, {
    query: { enabled: !!commentId, queryKey: ["comment-reaction", commentId] },
  });
  return {
    ...query,
    data: query.data?.data || { reactionCount: 0, userHasReacted: false },
  };
}
