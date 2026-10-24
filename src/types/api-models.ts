import type { components } from './api';

export type { components };

export type UserSummaryResponseDto = components['schemas']['UserSummaryResponseDto'];

export type BadRequestErrorDto = components['schemas']['BadRequestErrorDto'];
export type UnauthorizedErrorDto = components['schemas']['UnauthorizedErrorDto'];
export type CreateProfileDto = components['schemas']['CreateProfileDto'];
export type UpdateProfileDto = components['schemas']['UpdateProfileDto'];
export type CategoryDto = components['schemas']['CategoryDto'];
export type ChecklistItemDto = components['schemas']['ChecklistItemDto'];
export type ChecklistStatsDto = components['schemas']['ChecklistStatsDto'];
export type CityDto = components['schemas']['CityDto'];
export type CommentResponseDto = components['schemas']['CommentResponseDto'];
export type CommentReactionResponseDto = components['schemas']['CommentReactionResponseDto'];
export type CreateCommentDto = components['schemas']['CreateCommentDto'];
export type PaginatedCommentsDto = components['schemas']['PaginatedCommentsDto'];
export type CommunityTipResponseDtoType = 'TRY' | 'AVOID';
export const CommunityTipResponseDtoType = {
    TRY: 'TRY',
    AVOID: 'AVOID',
} as const;
export type CreateVoteResponseDto = components['schemas']['CreateVoteResponseDto'];
export type CreateSpotDto = components['schemas']['CreateSpotDto'];
export type UpdateSpotDto = components['schemas']['UpdateSpotDto'];
export type SpotSearchDto = components['schemas']['SpotSearchDto'];

export type ImageVariantsDto = components['schemas']['ImageVariantsDto'];

export type ProfileResponseDto = components['schemas']['ProfileResponseDto'] & {
    name?: string | null | Record<string, never>;
    avatarUrl?: string | null | Record<string, never>;
    blurPlaceholder?: string | null | Record<string, never>;
    imageVariants?: ImageVariantsDto;
};

export type GalleryImageResponseDto = Omit<
    components['schemas']['GalleryImageResponseDto'],
    'blurPlaceholder' | 'user' | 'imageVariants'
> & {
    blurPlaceholder?: string | Record<string, never>;
    user: UserSummaryResponseDto;
    imageVariants?: ImageVariantsDto;
};

export type LeaderboardProfileDto = components['schemas']['LeaderboardProfileDto'];
export type LiveVibeDto = components['schemas']['LiveVibeDto'];
export type MessageResponseDto = components['schemas']['MessageResponseDto'];
export type PaginatedChecklistItemResponseDto =
    components['schemas']['PaginatedChecklistItemResponseDto'];
export type PaginatedCommunityTipsResponseDto = {
    data: CommunityTipResponseDto[];
    pagination: {
        skip: number;
        take: number;
        total: number;
        hasMore?: boolean;
    };
};
export type PaginatedGalleryImagesResponseDto = {
    data: GalleryImageResponseDto[];
    pagination: {
        skip: number;
        take: number;
        total: number;
        hasMore?: boolean;
    };
};
export type PaginatedLiveVibesDto = components['schemas']['PaginatedLiveVibesDto'];
export type PaginatedPriceReportsDto = components['schemas']['PaginatedPriceReportsDto'];
export type PaginatedScamAlertsResponseDto = {
    data: ScamAlertResponseDto[];
    pagination: {
        skip: number;
        take: number;
        total: number;
        hasMore?: boolean;
    };
};
export type PaginatedSpotsWithStatsResponseDto = {
    data: SpotWithStatsResponseDto[];
    pagination: {
        skip: number;
        take: number;
        total: number;
        hasMore?: boolean;
    };
};
export type PriceReportDto = components['schemas']['PriceReportDto'];
export type ReportResponseDto = components['schemas']['ReportResponseDto'];
export type ScamAlertsControllerFindAllParams = {
    skip?: number;
    take?: number;
    search?: string;
    cityId?: string;
    categoryId?: string;
    sort?: 'newest' | 'popular';
};
export type CommentsControllerFindByScamAlertParams = {
    skip?: number;
    take?: number;
};

export type SpotWithStatsResponseDto = Omit<
    components['schemas']['SpotWithStatsResponseDto'],
    | 'blurPlaceholder'
    | 'imageVariants'
    | 'user'
    | 'activityStats'
    | 'vibeStats'
    | 'priceStats'
    | 'tipStats'
    | '_count'
> & {
    blurPlaceholder?: string | Record<string, never>;
    imageVariants?: ImageVariantsDto;
    user: UserSummaryResponseDto;
    activityStats: {
        lastActivity?: string | null;
        totalContributors?: number;
    };
    vibeStats: {
        avgCrowdLevel?: number;
        count?: number;
    };
    priceStats: {
        avg?: number;
        min?: number;
        max?: number;
        count?: number;
    };
    tipStats: {
        tryCount?: number;
        avoidCount?: number;
    };
    _count?: {
        votes?: number;
        comments?: number;
        priceReports?: number;
        vibeChecks?: number;
        communityTips?: number;
    };
};

export type ScamAlertResponseDto = Omit<
    components['schemas']['ScamAlertResponseDto'],
    'blurPlaceholder' | 'imageVariants' | 'user' | '_count'
> & {
    blurPlaceholder?: string | Record<string, never>;
    imageVariants?: ImageVariantsDto;
    user: UserSummaryResponseDto;
    _count?: {
        votes?: number;
        comments?: number;
    };
};

export type CommunityTipResponseDto = Omit<
    components['schemas']['CommunityTipResponseDto'],
    'user' | 'type'
> & {
    user: UserSummaryResponseDto;
    type: CommunityTipResponseDtoType;
};

export const GalleryControllerGetGallerySort = {
    newest: 'newest',
    popular: 'popular',
} as const;

export type GalleryControllerGetGallerySort =
    (typeof GalleryControllerGetGallerySort)[keyof typeof GalleryControllerGetGallerySort];
