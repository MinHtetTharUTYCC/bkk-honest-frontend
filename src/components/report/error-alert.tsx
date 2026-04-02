'use client';

import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
    message: string;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
    return (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} />
            {message}
        </div>
    );
}
