'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import ReportButton from '@/components/report/report-button';

interface TipActionsMenuProps {
  tipId: string;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TipActionsMenu({
  tipId,
  isOwner,
  onEdit,
  onDelete,
}: TipActionsMenuProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDesktopMenu, setShowDesktopMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowDesktopMenu(false);
      }
    }

    if (showDesktopMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDesktopMenu]);

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    setShowMobileMenu(false);
    onDelete?.();
  };

  const handleEdit = () => {
    setShowMobileMenu(false);
    setShowDesktopMenu(false);
    onEdit?.();
  };

  if (!isOwner) {
    return (
      <ReportButton targetId={tipId} reportType="COMMUNITY_TIP" size="sm" />
    );
  }

  return (
    <>
      {/* Desktop Menu */}
      <div className="hidden md:block relative" ref={menuRef}>
        <button
          onClick={() => setShowDesktopMenu(!showDesktopMenu)}
          className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <MoreVertical size={16} />
        </button>

        {showDesktopMenu && (
          <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden min-w-48">
            <button
              onClick={handleEdit}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors text-left text-sm font-medium"
            >
              <Edit2 size={16} />
              Edit Tip
            </button>
            <button
              onClick={() => {
                setShowDesktopMenu(false);
                setShowDeleteConfirm(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-left text-sm font-medium border-t border-border"
            >
              <Trash2 size={16} />
              Delete Tip
            </button>
            <div className="border-t border-border p-2">
              <ReportButton
                targetId={tipId}
                reportType="COMMUNITY_TIP"
                size="sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowMobileMenu(true)}
        className="md:hidden p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <MoreVertical size={16} />
      </button>

      {/* Mobile Bottom Sheet */}
      <BottomSheet
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        title="Tip Options"
      >
        <div className="space-y-3">
          <button
            onClick={handleEdit}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
          >
            <Edit2 size={18} />
            Edit Tip
          </button>
          <button
            onClick={() => {
              setShowMobileMenu(false);
              setShowDeleteConfirm(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium transition-colors"
          >
            <Trash2 size={18} />
            Delete Tip
          </button>
          <div className="pt-2 border-t border-border">
            <ReportButton
              targetId={tipId}
              reportType="COMMUNITY_TIP"
              size="sm"
            />
          </div>
        </div>
      </BottomSheet>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertCircle size={20} className="text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">Delete Tip?</h3>
                <p className="text-white/60 text-sm mt-1">
                  This action cannot be undone. All comments and reactions will be lost.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
