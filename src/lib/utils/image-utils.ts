/**
 * Image Utility Functions - Type-Safe Image Variant Selection
 *
 * Provides utility functions for safe, type-safe image variant selection.
 * All functions work with orval-generated types (ImageVariantsDto, etc.)
 * and handle the 2-variant structure (thumbnail + display).
 */

import type {
  ImageVariantsDto,
  GalleryImageResponseDto,
  ProfileResponseDto,
  SpotWithStatsResponseDto,
  ScamAlertResponseDto,
} from "@/types/api-models";

/**
 * Variant type - represents available image sizes
 */
export type VariantType = "thumbnail" | "display";

/**
 * Screen size context for responsive image selection
 */
export type ScreenContext = "mobile" | "tablet" | "desktop";

/**
 * Safe image variant - either variants object or blur placeholder
 */
export interface SafeImageVariant {
  variants?: ImageVariantsDto;
  blurPlaceholder?: string | null;
}

/**
 * Union type for all DTOs that contain image metadata
 */
export type ImageObjectDto =
  | GalleryImageResponseDto
  | SpotWithStatsResponseDto
  | ProfileResponseDto
  | ScamAlertResponseDto;

/**
 * Get a specific image variant safely
 *
 * @param variants - ImageVariantsDto with variant URLs
 * @param type - Which variant to retrieve ('thumbnail' or 'display')
 * @returns The variant URL or undefined if not available
 *
 * @example
 * const url = getImageVariant(variants, 'thumbnail');
 */
export function getImageVariant(
  variants: ImageVariantsDto | undefined,
  type: VariantType,
): string | undefined {
  if (!variants) return undefined;
  return variants[type];
}

/**
 * Select the appropriate image variant based on screen size context
 *
 * @param variants - ImageVariantsDto with variant URLs
 * @param context - Screen size context (mobile, tablet, desktop)
 * @returns The appropriate variant URL
 *
 * @example
 * const url = getResponsiveImageVariant(variants, 'mobile');  // Returns thumbnail
 * const url = getResponsiveImageVariant(variants, 'desktop'); // Returns display
 */
export function getResponsiveImageVariant(
  variants: ImageVariantsDto | undefined,
  context: ScreenContext,
): string | undefined {
  if (!variants) return undefined;

  switch (context) {
    case "mobile":
    case "tablet":
      return getImageVariant(variants, "thumbnail");
    case "desktop":
      return getImageVariant(variants, "display");
    default:
      return getImageVariant(variants, "display");
  }
}

/**
 * Select the best image for gallery display
 * Uses 'display' variant for full view
 *
 * @param variants - ImageVariantsDto with variant URLs
 * @returns The display variant URL
 */
export function getGalleryImageUrl(
  variants: ImageVariantsDto | undefined,
): string | undefined {
  return getImageVariant(variants, "display");
}

/**
 * Select the best image for thumbnail/grid display
 * Uses 'thumbnail' variant for small previews
 *
 * @param variants - ImageVariantsDto with variant URLs
 * @returns The thumbnail variant URL
 */
export function getThumbnailImageUrl(
  variants: ImageVariantsDto | undefined,
): string | undefined {
  return getImageVariant(variants, "thumbnail");
}

/**
 * Select the best image for card display
 * Uses 'thumbnail' variant for cards
 *
 * @param variants - ImageVariantsDto with variant URLs
 * @returns The thumbnail variant URL
 */
export function getCardImageUrl(
  variants: ImageVariantsDto | undefined,
): string | undefined {
  return getImageVariant(variants, "thumbnail");
}

/**
 * Select the best image for hero/header display
 * Uses 'display' variant for full-width headers
 *
 * @param variants - ImageVariantsDto with variant URLs
 * @returns The display variant URL
 */
export function getHeroImageUrl(
  variants: ImageVariantsDto | undefined,
): string | undefined {
  return getImageVariant(variants, "display");
}

/**
 * Safely extract image data from any image response object
 * Handles gallery images, spot images, profile avatars, scam alerts
 *
 * @param imageData - Image response object (GalleryImageResponseDto, etc.)
 * @returns SafeImageVariant with variants and blur placeholder
 *
 * @example
 * const image = selectImageVariantSafely(galleryImage);
 * const url = getGalleryImageUrl(image.variants);
 */
export function selectImageVariantSafely(
  imageData: ImageObjectDto | undefined,
): SafeImageVariant {
  if (!imageData) {
    return {};
  }

  return {
    variants: imageData.imageVariants,
    blurPlaceholder:
      typeof imageData.blurPlaceholder === "string"
        ? imageData.blurPlaceholder
        : null,
  };
}

/**
 * Build the final image URL with proper variant selection
 *
 * Priority:
 * 1. Selected variant URL (primary)
 *
 * @param variants - ImageVariantsDto with variant URLs
 * @param variantType - Which variant to select
 * @returns The image URL or undefined
 *
 * @example
 * const url = buildImageUrl(variants, 'thumbnail');
 */
export function buildImageUrl(
  variants: ImageVariantsDto | undefined,
  variantType: VariantType = "display",
): string | undefined {
  // Use variant
  const variantUrl = getImageVariant(variants, variantType);
  if (variantUrl) return variantUrl;

  // No URL available
  return undefined;
}

/**
 * Check if variants are available and valid
 *
 * @param variants - ImageVariantsDto to check
 * @returns true if variants object exists and has required properties
 *
 * @example
 * if (hasValidVariants(image.imageVariants)) {
 *   // Can safely use variants
 * }
 */
export function hasValidVariants(
  variants: ImageVariantsDto | undefined,
): variants is ImageVariantsDto {
  return !!variants && "thumbnail" in variants && "display" in variants;
}

/**
 * Get image dimensions for sizing
 *
 * @param imageData - Image response object
 * @returns Object with width and height, or undefined if not available
 *
 * @example
 * const dimensions = getImageDimensions(image);
 * if (dimensions) {
 *   aspectRatio = dimensions.width / dimensions.height;
 * }
 */
type ImageWithDimensions = ImageObjectDto & {
  imageWidth?: number;
  imageHeight?: number;
};

export function getImageDimensions(imageData: ImageObjectDto | undefined) {
  const data = imageData as ImageWithDimensions | undefined;
  if (!data || !data.imageWidth || !data.imageHeight) {
    return undefined;
  }

  return {
    width: data.imageWidth,
    height: data.imageHeight,
    aspectRatio: data.imageWidth / data.imageHeight,
  };
}

/**
 * Check if image is degraded quality
 *
 * @param imageData - Image response object
 * @returns true if image is marked as degraded
 *
 * @example
 * if (isImageDegraded(image)) {
 *   showQualityWarning();
 * }
 */
export function isImageDegraded(
  imageData: ImageObjectDto | undefined,
): boolean {
  return imageData?.isDegraded === true;
}

/**
 * Get image quality score
 *
 * @param imageData - Image response object
 * @returns Quality score (0-100) or undefined
 *
 * @example
 * const quality = getImageQualityScore(image);
 * if (quality && quality < 50) {
 *   showLowQualityWarning();
 * }
 */
type ImageWithQuality = ImageObjectDto & {
  qualityScore?: number;
};

export function getImageQualityScore(
  imageData: ImageObjectDto | undefined,
): number | undefined {
  return (imageData as ImageWithQuality | undefined)?.qualityScore;
}

/**
 * Build complete image object for rendering
 *
 * Combines variants, URLs, metadata, and blur placeholder into single object
 *
 * @param imageData - Image response object (GalleryImageResponseDto, etc.)
 * @param screenContext - Current screen size context for responsive variant
 * @param altText - Alternative text for image
 * @returns Complete image object ready for rendering
 *
 * @example
 * const image = buildRenderableImage(galleryImage, 'mobile');
 * <img src={image.url} alt="..." {...image.renderProps} />
 */
export interface RenderableImage {
  url: string;
  thumbnailUrl?: string;
  displayUrl?: string;
  blurPlaceholder?: string | null;
  width?: number;
  height?: number;
  isDegraded: boolean;
  qualityScore?: number;
  renderProps: {
    alt: string;
    loading: "lazy" | "eager";
    decoding: "auto" | "sync" | "async";
  };
}

export function buildRenderableImage(
  imageData: ImageObjectDto | undefined,
  screenContext: ScreenContext = "desktop",
  altText: string = "Image",
): RenderableImage | undefined {
  const { variants, blurPlaceholder } = selectImageVariantSafely(imageData);
  const dimensions = getImageDimensions(imageData);

  if (!variants) {
    return undefined;
  }

  const finalUrl =
    getResponsiveImageVariant(variants, screenContext) ||
    buildImageUrl(variants, "display") ||
    "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E";

  return {
    url: finalUrl,
    thumbnailUrl: getThumbnailImageUrl(variants),
    displayUrl: getGalleryImageUrl(variants),
    blurPlaceholder,
    width: dimensions?.width,
    height: dimensions?.height,
    isDegraded: isImageDegraded(imageData),
    qualityScore: getImageQualityScore(imageData),
    renderProps: {
      alt: altText,
      loading: "lazy" as const,
      decoding: "async" as const,
    },
  };
}

/**
 * Extract image data from gallery image response
 * Type-safe accessor for gallery images
 *
 * @param galleryImage - GalleryImageResponseDto
 * @returns Image data object with all properties
 */
export function extractGalleryImageData(galleryImage: GalleryImageResponseDto) {
  return {
    id: galleryImage.id,
    url: galleryImage.url,
    variants: galleryImage.imageVariants,
    blurPlaceholder: galleryImage.blurPlaceholder,
    dimensions: {
      width: undefined as number | undefined,
      height: undefined as number | undefined,
    },
    metadata: {
      mimeType: undefined as string | undefined,
      fileSize: undefined as number | undefined,
      qualityScore: undefined as number | undefined,
      isDegraded: galleryImage.isDegraded,
    },
  };
}

/**
 * Extract image data from spot response
 * Type-safe accessor for spot images
 *
 * @param spot - SpotWithStatsResponseDto
 * @returns Image data object with all properties
 */
export function extractSpotImageData(spot: SpotWithStatsResponseDto) {
  return {
    variants: spot.imageVariants,
    blurPlaceholder: spot.blurPlaceholder,
    dimensions: {
      width: spot.imageWidth,
      height: spot.imageHeight,
    },
    metadata: {
      mimeType: spot.imageMimeType,
      fileSize: spot.imageSize,
      qualityScore: spot.qualityScore,
      isDegraded: spot.isDegraded,
    },
  };
}

/**
 * Extract image data from profile response
 * Type-safe accessor for profile avatars
 *
 * @param profile - ProfileResponseDto
 * @returns Image data object with all properties
 */
export function extractProfileImageData(profile: ProfileResponseDto) {
  return {
    url: profile.avatarUrl,
    variants: profile.imageVariants,
    blurPlaceholder: profile.blurPlaceholder,
    dimensions: {
      width: profile.imageWidth,
      height: profile.imageHeight,
    },
    metadata: {
      mimeType: profile.imageMimeType,
      fileSize: profile.imageSize,
      qualityScore: profile.qualityScore,
      isDegraded: profile.isDegraded,
    },
  };
}

/**
 * Extract image data from scam alert response
 * Type-safe accessor for scam alert images
 *
 * @param alert - ScamAlertResponseDto
 * @returns Image data object with all properties
 */
export function extractScamAlertImageData(alert: ScamAlertResponseDto) {
  return {
    variants: alert.imageVariants,
    blurPlaceholder: alert.blurPlaceholder,
    dimensions: {
      width: alert.imageWidth,
      height: alert.imageHeight,
    },
    metadata: {
      mimeType: alert.imageMimeType,
      fileSize: alert.imageSize,
      qualityScore: alert.qualityScore,
      isDegraded: alert.isDegraded,
    },
  };
}
