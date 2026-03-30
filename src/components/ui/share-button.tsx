'use client';

import * as React from 'react';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Share2, Copy, Twitter, Facebook, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function ShareButton({ 
  title, 
  text, 
  url, 
  className, 
  variant = 'default',
  size = 'md'
}: ShareButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = text || `Check out ${title} on BKK Honest!`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for non-secure contexts (HTTP) or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        // Ensure textarea is not visible but stays in the document to allow copying
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        } catch (err) {
          console.error('Fallback copy failed:', err);
        }
        
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank');
  };

  const sizes = {
    sm: 'p-1.5 text-xs',
    md: 'p-2.5 text-sm',
    lg: 'p-4 text-base',
  };

  const variants = {
    default: 'bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white',
    ghost: 'bg-transparent hover:bg-white/5 text-white/50 hover:text-white',
    outline: 'bg-transparent border border-white/20 hover:border-amber-400 text-white/50 hover:text-amber-400',
  };

  const buttonContent = (
    <div className={cn(
      "rounded-full transition-all flex items-center justify-center gap-2",
      sizes[size],
      variants[variant],
      className
    )}>
      <Share2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      {size === 'lg' && <span className="font-bold uppercase tracking-widest text-[10px]">Share</span>}
    </div>
  );

  // If mobile and supports native share, use that
  if (typeof navigator !== 'undefined' && !!navigator.share) {
    return (
      <button onClick={handleShare} className="focus:outline-none">
        {buttonContent}
      </button>
    );
  }

  // Desktop/Unsupported fallback
  return (
    <DropdownMenu trigger={buttonContent} align="right">
      <DropdownMenuItem onClick={copyToClipboard}>
        {copied ? (
          <>
            <Check size={16} className="text-emerald-400" />
            <span className="text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy size={16} />
            <span>Copy Link</span>
          </>
        )}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={shareToTwitter}>
        <Twitter size={16} className="text-sky-400" />
        <span>Twitter / X</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={shareToFacebook}>
        <Facebook size={16} className="text-blue-500" />
        <span>Facebook</span>
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
