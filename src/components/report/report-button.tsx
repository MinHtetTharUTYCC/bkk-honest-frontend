'use client';

import { Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';

interface ReportButtonProps {
  targetId: string;
  reportType: 'SPOT' | 'COMMUNITY_TIP' | 'SCAM_ALERT' | 'COMMENT' | 'PROFILE';
  size?: 'sm' | 'md';
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export default function ReportButton({
  targetId,
  reportType,
  size = 'sm',
  children,
  className,
  onClick,
}: ReportButtonProps) {
  const { user } = useAuth();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Join us first to report content');
      return;
    }

    onClick?.(e);
    
    // Dispatch custom event to the GlobalReportModal sitting in layout.tsx
    window.dispatchEvent(
      new CustomEvent('OPEN_REPORT_MODAL', {
        detail: { targetId, reportType },
      })
    );
  };

  return (
    <>
      {children ? (
        <div onClick={handleClick} className={cn("cursor-pointer w-full", className)}>
          {children}
        </div>
      ) : (
        <button
          onClick={handleClick}
          className={cn(
            sizeClasses[size],
            'rounded-full bg-white/8 hover:bg-white/12 flex items-center justify-center text-white/60 hover:text-red-500 transition-all duration-200',
            className
          )}
          title="Report this content"
        >
          <Flag size={iconSizes[size]} />
        </button>
      )}
    </>
  );
}
