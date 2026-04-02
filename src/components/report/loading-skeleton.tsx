'use client';

export default function LoadingSkeleton() {
    return (
        <div className="space-y-12 animate-pulse">
            <div className="h-12 w-48 bg-white/5 rounded-xl" />
            <div className="h-16 bg-white/5 rounded-3xl" />
            <div className="h-96 bg-white/5 rounded-2xl" />
        </div>
    );
}
