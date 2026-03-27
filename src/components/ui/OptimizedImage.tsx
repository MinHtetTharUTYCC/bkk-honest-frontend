import Image from 'next/image';
import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface ImageVariants {
  thumbnail: string;
  medium: string;
  large: string;
  original: string;
}

interface OptimizedImageProps {
  variants?: ImageVariants | null;
  fallbackUrl?: string; // For backward compatibility with old non-variant images
  alt: string;
  size?: 'thumbnail' | 'medium' | 'large' | 'original';
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
 * image variant based on the size prop. Handles loading states, errors,
 * and provides blur placeholders for progressive loading.
 * 
 * @example
 * // With variants (new format)
 * <OptimizedImage
 *   variants={profile.imageVariants}
 *   alt={profile.name}
 *   size="medium"
 *   width={256}
 *   height={256}
 * />
 * 
 * @example
 * // Backward compatible with old URLs
 * <OptimizedImage
 *   fallbackUrl={profile.avatarUrl}
 *   alt={profile.name}
 *   size="thumbnail"
 *   width={128}
 *   height={128}
 * />
 */
export default function OptimizedImage({
  variants,
  fallbackUrl,
  alt,
  size = 'medium',
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

  // Select the appropriate variant URL
  const getImageUrl = (): string | null => {
    // If variants exist, use them
    if (variants && typeof variants === 'object') {
      return variants[size] || variants.medium || variants.large || null;
    }

    // Fallback to old-style single URL
    if (fallbackUrl) {
      return fallbackUrl;
    }

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
    return <Image {...imageProps} fill />;
  }

  // Render with explicit dimensions
  if (width && height) {
    return <Image {...imageProps} width={width} height={height} />;
  }

  // Default: require dimensions
  console.warn('OptimizedImage: width and height are required when fill is false');
  return (
    <div
      className={`flex items-center justify-center bg-gray-100 ${className}`}
    >
      <ImageIcon className="w-8 h-8 text-gray-400" />
    </div>
  );
}

/**
 * Skeleton loading component for images
 */
export function SkeletonImage({ className = '', width, height }: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 ${className}`}
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
      className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full"
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
      <div className="w-full h-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg" />
    </div>
  );
}
