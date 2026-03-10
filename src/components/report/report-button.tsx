'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import ReportModal from './report-modal';

interface ReportButtonProps {
  targetId: string;
  reportType: 'SPOT' | 'COMMUNITY_TIP' | 'SCAM_ALERT' | 'COMMENT';
  size?: 'sm' | 'md';
}

export default function ReportButton({
  targetId,
  reportType,
  size = 'sm',
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

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`${sizeClasses[size]} rounded-full bg-white/8 hover:bg-white/12 flex items-center justify-center text-white/60 hover:text-red-500 transition-all duration-200`}
        title="Report this content"
      >
        <Flag size={iconSizes[size]} />
      </button>

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
