'use client';

import React from 'react';

interface FooterSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const FooterSection: React.FC<FooterSectionProps> = ({ 
  title, 
  children, 
  className = '' 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-white font-semibold text-base mb-3 pb-2 border-b border-white/10">
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

export { FooterSection };
export type { FooterSectionProps };