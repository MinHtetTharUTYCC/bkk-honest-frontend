"use client";

import { useMutation, useInfiniteQuery } from "@tanstack/react-query";
import {
  useGalleryControllerGetGallery,
  useGalleryControllerDeleteImage,
  useGalleryControllerFlagImage,
  galleryControllerGetGallery,
} from "@/api/generated/gallery/gallery";
import { GalleryControllerGetGallerySort } from "@/api/generated/model/galleryControllerGetGallerySort";
import { AXIOS_INSTANCE } from "@/api/mutator/custom-instance";
import { getNextSkipFromPage } from "./base";

export function useSpotGallery(
  spotId: string,
  limit: number = 12,
  sort: "newest" | "popular" = "newest",
) {
  const normalizedSort =
    sort === "popular"
      ? GalleryControllerGetGallerySort.popular
      : GalleryControllerGetGallerySort.newest;

  const query = useGalleryControllerGetGallery(
    spotId,
    { take: limit, sort: normalizedSort },
    { query: { enabled: !!spotId } },
  );
  return { ...query, data: query.data?.data || [] };
}

export function useInfiniteSpotGallery(
  spotId: string,
  sort: "newest" | "popular" = "newest",
) {
  const normalizedSort =
    sort === "popular"
      ? GalleryControllerGetGallerySort.popular
      : GalleryControllerGetGallerySort.newest;

  return useInfiniteQuery({
    queryKey: ["gallery-infinite", spotId, normalizedSort],
    queryFn: async ({ pageParam = 0 }) => {
      const skip = pageParam > 0 ? pageParam : undefined;
      return galleryControllerGetGallery(spotId, {
        take: 12,
        sort: normalizedSort,
        skip,
      });
    },
    getNextPageParam: (lastPage: unknown) =>
      getNextSkipFromPage(lastPage, true),
    enabled: !!spotId,
    initialPageParam: 0,
  });
}

export function useUploadSpotImage() {
  return useMutation({
    mutationFn: async ({ spotId, file }: { spotId: string; file: File }) => {
      const formData = new FormData();
      formData.append("image", file);

      const { data } = await AXIOS_INSTANCE.post(
        `/gallery/upload/${spotId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return data;
    },
  });
}

export { useGalleryControllerDeleteImage as useDeleteGalleryImage };
export { useGalleryControllerFlagImage as useFlagGalleryImage };
