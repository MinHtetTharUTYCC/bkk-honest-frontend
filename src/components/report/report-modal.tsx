'use client';

import { useState } from 'react';
import { Flag, X, Loader2 } from 'lucide-react';
import { useReport } from '@/hooks/use-report';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ReportModalProps {
    targetId: string;
    reportType: 'SPOT' | 'COMMUNITY_TIP' | 'SCAM_ALERT' | 'COMMENT' | 'PROFILE';
    onClose: () => void;
}

const REPORT_REASONS = [
    { value: 'SPAM', label: 'Spam or duplicate' },
    { value: 'INAPPROPRIATE', label: 'Inappropriate content' },
    { value: 'FAKE_INFO', label: 'Fake or misleading info' },
    { value: 'SAFETY_CONCERN', label: 'Safety concern' },
    { value: 'OTHER', label: 'Other reason' },
];

export default function ReportModal({ targetId, reportType, onClose }: ReportModalProps) {
    const [reason, setReason] = useState<string>('');
    const [description, setDescription] = useState('');
    const reportMutation = useReport();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason) {
            toast.error('Please select a reason');
            return;
        }

        try {
            await reportMutation.mutateAsync({
                targetId,
                reportType,
                reason,
                description: description || undefined,
            });
            toast.success('Report submitted. Thank you for helping keep our community safe.');
            onClose();
        } catch (error) {
            toast.error(error instanceof Error ? `: ${error.message}` : 'Failed to submit report');
        }
    };

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="absolute inset-0 bg-black/75 backdrop-blur-xl"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose();
                }}
            />

            <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden">
                <header className="p-6 border-b border-white/8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center">
                            <Flag className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Report Content</h3>
                            <p className="text-xs text-white/40">Help us keep the community safe</p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClose();
                        }}
                        className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center hover:bg-white/12 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">
                            Reason
                        </label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a reason..." />
                            </SelectTrigger>
                            <SelectContent>
                                {REPORT_REASONS.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">
                            Additional Details (optional)
                        </label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Help us understand why you're reporting this..."
                            className="w-full px-4 py-3 rounded-lg bg-white/8 border border-white/12 text-foreground placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none h-24"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={reportMutation.isPending || !reason}
                        className="w-full py-3 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        {reportMutation.isPending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Flag size={18} />
                                Submit Report
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
