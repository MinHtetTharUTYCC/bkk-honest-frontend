'use client';

import { useMutation } from '@tanstack/react-query';
import { 
    useGalleryControllerGetGalleryInfinite,
    useGalleryControllerGetGallery,
    useGalleryControllerDeleteImage,
    useGalleryControllerFlagImage
} from '@/api/generated/gallery/gallery';
import { GalleryControllerGetGallerySort } from '@/api/generated/model/galleryControllerGetGallerySort';
import { AXIOS_INSTANCE } from '@/api/mutator/custom-instance';
import { getNextSkipFromPage } from './base';

export function useSpotGallery(spotId: string, limit: number = 12, sort: 'newest' | 'popular' = 'newest') {
    const normalizedSort = sort === 'popular'
        ? GalleryControllerGetGallerySort.popular
        : GalleryControllerGetGallerySort.newest;
        
    const query = useGalleryControllerGetGallery(spotId, { take: limit, sort: normalizedSort }, { query: { enabled: !!spotId } });
    return { ...query, data: query.data?.data };
}

export function useInfiniteSpotGallery(spotId: string, sort: 'newest' | 'popular' = 'newest') {
    const normalizedSort = sort === 'popular'
        ? GalleryControllerGetGallerySort.popular
        : GalleryControllerGetGallerySort.newest;
        
    return useGalleryControllerGetGalleryInfinite(spotId, {
        take: 12,
        sort: normalizedSort,
    }, {
        query: {
            queryKey: ['gallery-infinite', spotId, normalizedSort],
            initialPageParam: 0,
            getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage, true),
            enabled: !!spotId
        },
    });
}

export function useUploadSpotImage() {
    return useMutation({
        mutationFn: async ({ spotId, file }: { spotId: string; file: File }) => {
            const formData = new FormData();
            formData.append('image', file);
            
            const { data } = await AXIOS_INSTANCE.post(`/gallery/upload/${spotId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        }
    });
}

export { useGalleryControllerDeleteImage as useDeleteGalleryImage };
export { useGalleryControllerFlagImage as useFlagGalleryImage };
