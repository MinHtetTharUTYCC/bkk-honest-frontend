'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import ReportModal from './report-modal';
import { cn } from '@/lib/utils';

interface ReportButtonProps {
  targetId: string;
  reportType: 'SPOT' | 'COMMUNITY_TIP' | 'SCAM_ALERT' | 'COMMENT';
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    onClick?.(e);
    setIsModalOpen(true);
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

      {isModalOpen && (
        <ReportModal
          targetId={targetId}
          reportType={reportType}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
