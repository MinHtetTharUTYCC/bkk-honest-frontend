'use client';

import { useState } from 'react';
import { MoreVertical, Edit2, Trash2, AlertCircle, Flag } from 'lucide-react';
import ReportButton from '@/components/report/report-button';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface TipActionsMenuProps {
    tipId: string;
    isOwner: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function TipActionsMenu({ tipId, isOwner, onEdit, onDelete }: TipActionsMenuProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    return (
        <>
            <DropdownMenu
                trigger={
                    <button className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10 shadow-sm active:scale-95 shrink-0">
                        <MoreVertical size={16} />
                    </button>
                }
            >
                {isOwner ? (
                    <>
                        <DropdownMenuItem onClick={onEdit} className="gap-3 py-3">
                            <Edit2 size={16} />
                            <span>Edit Tip</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setShowDeleteConfirm(true)}
                            className="gap-3 py-3"
                            danger
                        >
                            <Trash2 size={16} />
                            <span>Delete Tip</span>
                        </DropdownMenuItem>
                    </>
                ) : (
                    <DropdownMenuItem asChild>
                        <ReportButton
                            targetId={tipId}
                            reportType="COMMUNITY_TIP"
                            className="w-full flex items-center justify-start gap-3 py-3 px-4 text-sm font-medium hover:bg-white/5 transition-colors border-none text-white/70 hover:text-white"
                        >
                            <Flag size={16} />
                            <span>Report Tip</span>
                        </ReportButton>
                    </DropdownMenuItem>
                )}
            </DropdownMenu>

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
                                    This action cannot be undone. All comments and reactions will be
                                    lost.
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
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    onDelete?.();
                                }}
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
