import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'image' | 'text' | 'avatar';
}

export function Skeleton({ className, variant = 'text', ...props }: SkeletonProps) {
  const baseClasses = 'bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse';
  
  const variantClasses = {
    image: 'rounded-xl aspect-square',
    text: 'rounded-lg h-4',
    avatar: 'rounded-full h-10 w-10',
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="flex-shrink-0 w-full bg-card rounded-2xl p-5 border border-white/8 space-y-4">
      {/* Image skeleton */}
      <Skeleton variant="image" className="w-full h-48" />
      
      {/* Title skeleton */}
      <Skeleton className="w-3/4 h-5" />
      
      {/* Subtitle skeleton */}
      <Skeleton className="w-1/2 h-3" />
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    </div>
  );
}

export function ScamAlertCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-white/8 shadow-sm overflow-hidden flex flex-row gap-4 p-5">
      {/* Image skeleton */}
      <Skeleton variant="image" className="w-36 h-36 shrink-0" />
      
      {/* Content skeleton */}
      <div className="flex-1 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="w-24 h-3" />
          <Skeleton className="w-32 h-3" />
        </div>
        
        {/* Title */}
        <Skeleton className="w-3/4 h-5" />
        
        {/* Description lines */}
        <div className="space-y-2">
          <Skeleton className="w-full h-3" />
          <Skeleton className="w-5/6 h-3" />
        </div>
        
        {/* Footer button */}
        <div className="mt-auto pt-3">
          <Skeleton className="w-20 h-6" />
        </div>
      </div>
    </div>
  );
}
