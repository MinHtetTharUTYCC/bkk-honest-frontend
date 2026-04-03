'use client';

import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { unwrapApiSuccessData } from '@/lib/api/api-envelope';
import { throwApiError } from '@/lib/errors/throw-api-error';
import { openApiClient } from '@/lib/api/openapi-client';
import type {
    GalleryImageResponseDto,
    MessageResponseDto,
    PaginatedGalleryImagesResponseDto,
} from '@/types/api-models';
import { GalleryControllerGetGallerySort } from '@/types/api-models';
import { getNextSkipFromPage } from './base';

export function useSpotGallery(
    spotId: string,
    limit: number = 12,
    sort: 'newest' | 'popular' = 'newest',
) {
    const normalizedSort =
        sort === 'popular'
            ? GalleryControllerGetGallerySort.popular
            : GalleryControllerGetGallerySort.newest;

    const query = useQuery({
        queryKey: ['spot-gallery', spotId, normalizedSort, limit],
        enabled: !!spotId,
        queryFn: async () => {
            const { data, error } = await openApiClient.GET('/gallery/spot/{spotId}', {
                params: { path: { spotId }, query: { take: limit, sort: normalizedSort } },
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<PaginatedGalleryImagesResponseDto>(data);
        },
    });
    return { ...query, data: query.data || [] };
}

export function useInfiniteSpotGallery(spotId: string, sort: 'newest' | 'popular' = 'newest') {
    const normalizedSort =
        sort === 'popular'
            ? GalleryControllerGetGallerySort.popular
            : GalleryControllerGetGallerySort.newest;

    return useInfiniteQuery({
        queryKey: ['gallery-infinite', spotId, normalizedSort],
        queryFn: async ({ pageParam = 0 }) => {
            const skip = pageParam > 0 ? pageParam : undefined;
            const { data, error } = await openApiClient.GET('/gallery/spot/{spotId}', {
                params: {
                    path: { spotId },
                    query: {
                        take: 12,
                        sort: normalizedSort,
                        skip,
                    },
                },
            });

            if (error) {
                throwApiError(error);
            }

            return {
                data: unwrapApiSuccessData<PaginatedGalleryImagesResponseDto>(data),
            };
        },
        getNextPageParam: (lastPage: unknown) => {
            const pageData =
                typeof lastPage === 'object' && lastPage !== null && 'data' in lastPage
                    ? (lastPage as { data: unknown }).data
                    : lastPage;
            return getNextSkipFromPage(pageData, true);
        },
        enabled: !!spotId,
        initialPageParam: 0,
    });
}

export function useDeleteGalleryImage() {
    return useMutation({
        mutationKey: ['gallery-delete-image'],
        mutationFn: async ({ id }: { id: string }) => {
            const { data, error } = await openApiClient.DELETE('/gallery/{id}', {
                params: { path: { id } },
            });

            if (error) {
                throwApiError(error);
            }

            return { data: unwrapApiSuccessData<MessageResponseDto>(data) };
        },
    });
}

export function useFlagGalleryImage() {
    return useMutation({
        mutationKey: ['gallery-flag-image'],
        mutationFn: async ({ id }: { id: string }) => {
            const { data, error } = await openApiClient.POST('/gallery/{id}/flag', {
                params: { path: { id } },
            });

            if (error) {
                throwApiError(error);
            }

            return { data: unwrapApiSuccessData<MessageResponseDto>(data) };
        },
    });
}

export function useUploadGalleryImage() {
    return useMutation({
        mutationKey: ['gallery-upload-image'],
        mutationFn: async ({ spotId, data }: { spotId: string; data: { image: File } }) => {
            const formData = new FormData();
            formData.append('image', data.image);

            const { data: responseData, error } = await openApiClient.POST(
                '/gallery/upload/{spotId}',
                {
                    params: { path: { spotId } },
                    body: formData as unknown as never,
                },
            );

            if (error) {
                throwApiError(error);
            }

            return { data: unwrapApiSuccessData<GalleryImageResponseDto>(responseData) };
        },
    });
}
