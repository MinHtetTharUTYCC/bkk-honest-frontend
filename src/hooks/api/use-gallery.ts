'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import {
    useGalleryControllerGetGallery,
    useGalleryControllerDeleteImage,
    useGalleryControllerFlagImage,
    galleryControllerGetGallery,
    useGalleryControllerUploadImage,
} from '@/api/generated/gallery/gallery';
import { GalleryControllerGetGallerySort } from '@/api/generated/model/galleryControllerGetGallerySort';
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

    const query = useGalleryControllerGetGallery(
        spotId,
        { take: limit, sort: normalizedSort },
        { query: { enabled: !!spotId } },
    );
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
            return galleryControllerGetGallery(spotId, {
                take: 12,
                sort: normalizedSort,
                skip,
            });
        },
        getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage, true),
        enabled: !!spotId,
        initialPageParam: 0,
    });
}

export { useGalleryControllerDeleteImage as useDeleteGalleryImage };
export { useGalleryControllerFlagImage as useFlagGalleryImage };
export { useGalleryControllerUploadImage as useUploadGalleryImage };
