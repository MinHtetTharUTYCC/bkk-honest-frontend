"use client";
import OptimizedImage from "@/components/ui/OptimizedImage";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { ImageVariantsDto } from "@/api/generated/model";
import { getGalleryImageUrl } from "@/lib/image-utils";

interface ImageViewerProps {
  isOpen: boolean;
  imageVariants: ImageVariantsDto;
  alt?: string;
  onClose: () => void;
}

export function ImageViewer({
  isOpen,
  imageVariants,
  alt = "Image",
  onClose,
}: ImageViewerProps) {
  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const imageUrl = getGalleryImageUrl(imageVariants);
  if (!imageUrl) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md animate-in fade-in"
      onClick={handleOverlayClick}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="fixed top-6 right-6 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-full transition-colors duration-200 border border-white/20"
        aria-label="Close image viewer"
      >
        <X size={24} />
      </button>

      <div className="flex items-center justify-center w-screen h-screen">
        <div
          className="relative w-[90vw] h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <OptimizedImage
            variants={imageVariants}
            alt={alt}
            fill
            objectFit="contain"
          />
        </div>
      </div>
    </div>
  );
}
