import Image from 'next/image';
import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import type { ImageVariantsDto } from '@/types/api-models';
import { getImageVariant } from '@/lib/utils/image-utils';

type VariantSize = 'thumbnail' | 'display';

interface OptimizedImageProps {
    variants: ImageVariantsDto;
    alt: string;
    size?: VariantSize;
    className?: string;
    priority?: boolean;
    fill?: boolean;
    width?: number;
    height?: number;
    blurDataURL?: string;
    objectFit?: 'contain' | 'cover';
    onError?: () => void;
}

/**
 * OptimizedImage Component
 *
 * Wrapper around Next.js Image that automatically selects the appropriate
 * image variant based on the size prop. Uses type-safe orval-generated types.
 * Handles loading states, errors, and provides blur placeholders for progressive loading.
 *
 * Supports 2-variant structure: thumbnail (small) and display (full).
 *
 * @example
 * // With variants (required)
 * <OptimizedImage
 *   variants={profile.imageVariants}
 *   alt={profile.name}
 *   size="display"
 *   width={512}
 *   height={512}
 * />
 */
export default function OptimizedImage({
    variants,
    alt,
    size = 'display',
    className = '',
    priority = false,
    fill = false,
    width,
    height,
    blurDataURL,
    objectFit = 'cover',
    onError,
}: OptimizedImageProps) {
    const [hasError, setHasError] = useState(false);

    // Select the appropriate variant URL using type-safe utility
    const getImageUrl = (): string | null => {
        if (!variants) {
            return null;
        }

        const variantUrl = getImageVariant(variants, size);
        if (variantUrl) return variantUrl;

        // Fallback to other variant if requested not available
        const fallbackVariant = size === 'thumbnail' ? 'display' : 'thumbnail';
        const fallbackVariantUrl = getImageVariant(variants, fallbackVariant);
        if (fallbackVariantUrl) return fallbackVariantUrl;

        return null;
    };

    const imageUrl = getImageUrl();

    // Handle error state - show placeholder
    if (hasError || !imageUrl) {
        return (
            <div
                className={`flex items-center justify-center bg-gray-100 ${className}`}
                style={{ width, height }}
            >
                <div className="flex flex-col items-center gap-2 text-gray-400">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-xs">No Photo</span>
                </div>
            </div>
        );
    }

    const handleError = () => {
        setHasError(true);
        onError?.();
    };

    // Common props for Next.js Image
    const imageProps = {
        src: imageUrl,
        alt,
        priority,
        className,
        onError: handleError,
        style: { objectFit },
        ...(blurDataURL && {
            placeholder: 'blur' as const,
            blurDataURL,
        }),
    };

    // Render with fill prop (for responsive containers)
    if (fill) {
        return <Image {...imageProps} alt={alt} fill />;
    }

    // Render with explicit dimensions
    if (width && height) {
        return <Image {...imageProps} alt={alt} width={width} height={height} />;
    }

    // Default: require dimensions
    console.warn('OptimizedImage: width and height are required when fill is false');
    return (
        <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
            <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
    );
}

/**
 * Skeleton loading component for images
 */
export function SkeletonImage({
    className = '',
    width,
    height,
}: {
    className?: string;
    width?: number;
    height?: number;
}) {
    return (
        <div
            className={`animate-pulse bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 ${className}`}
            style={{ width, height }}
        />
    );
}

/**
 * Circular avatar skeleton
 */
export function SkeletonAvatar({ size = 40 }: { size?: number }) {
    return (
        <div
            className="animate-pulse bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full"
            style={{ width: size, height: size }}
        />
    );
}

/**
 * Card with image skeleton
 */
export function SkeletonCard({ aspectRatio = '4/5' }: { aspectRatio?: string }) {
    return (
        <div className="w-full" style={{ aspectRatio }}>
            <div className="w-full h-full animate-pulse bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg" />
        </div>
    );
}
