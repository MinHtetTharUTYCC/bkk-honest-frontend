'use client';

import {
    AlertTriangle,
    Calendar,
    User,
    Heart,
    Edit2,
    Trash2,
    Loader2,
    Save,
    X,
    Camera,
    MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoteToggle } from '@/hooks/use-vote-toggle';
import { useAuth } from '@/components/providers/auth-provider';
import { useState, useRef } from 'react';
import { useUpdateScamAlert, useDeleteScamAlert, useCategories, useCities } from '@/hooks/use-api';

interface ScamAlertCardProps {
    alert: any;
    onClick?: () => void;
}

export default function ScamAlertCard({ alert: initialAlert, onClick }: ScamAlertCardProps) {
    const { user } = useAuth();
    const [alert, setAlert] = useState(initialAlert);
    const { toggleVote, isPending: votePending } = useVoteToggle('alert');
    const updateScamMutation = useUpdateScamAlert();
    const deleteScamMutation = useDeleteScamAlert();
    const { data: categories } = useCategories();
    const { data: cities } = useCities();

    const isOwner = user?.id === alert.userId;

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(alert.scamName);
    const [editDesc, setEditDesc] = useState(alert.description);
    const [editPrev, setEditPrev] = useState(alert.preventionTip);
    const [editCategory, setEditCategory] = useState(alert.categoryId);
    const [editCity, setEditCity] = useState(alert.cityId);
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editPreview, setEditPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpdate = async () => {
        try {
            const result = await updateScamMutation.mutateAsync({
                id: alert.id,
                payload: {
                    scamName: editName,
                    description: editDesc,
                    preventionTip: editPrev,
                    categoryId: editCategory,
                    cityId: editCity,
                    image: editFile || undefined,
                },
            });
            setAlert(result.data || result);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert('Failed to update scam alert');
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this scam alert?')) {
            try {
                await deleteScamMutation.mutateAsync(alert.id);
            } catch (err) {
                console.error(err);
                alert('Failed to delete scam alert');
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditFile(file);
            setEditPreview(URL.createObjectURL(file));
        }
    };

    if (isEditing) {
        return (
            <div className="bg-card rounded-2xl border border-amber-400 p-6 flex flex-col gap-6 shadow-xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold text-foreground uppercase tracking-tight">
                        Edit Alert
                    </h3>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="p-2 hover:bg-white/8 rounded-full transition-colors"
                    >
                        <X size={18} className="text-white/40" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-24 h-24 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 transition-colors shrink-0 overflow-hidden relative group"
                        >
                            {editPreview || alert.imageUrl ? (
                                <img
                                    src={editPreview || alert.imageUrl}
                                    className="w-full h-full object-cover group-hover:opacity-50"
                                />
                            ) : (
                                <Camera size={20} className="text-white/20" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={16} className="text-amber-400" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />

                        <div className="flex-1 space-y-2">
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-medium text-foreground focus:outline-none focus:border-amber-400 transition-all"
                                placeholder="Scam name"
                            />
                            <div className="flex gap-2">
                                <select
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground focus:outline-none focus:border-amber-400 transition-all"
                                >
                                    {categories?.map((cat: any) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={editCity}
                                    onChange={(e) => setEditCity(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground focus:outline-none focus:border-amber-400 transition-all"
                                >
                                    {cities?.map((city: any) => (
                                        <option key={city.id} value={city.id}>
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-foreground/70 focus:outline-none focus:border-amber-400 transition-all min-h-[80px] resize-none"
                        placeholder="Scam description"
                    />

                    <input
                        type="text"
                        value={editPrev}
                        onChange={(e) => setEditPrev(e.target.value)}
                        className="w-full bg-emerald-400/8 border border-emerald-400/15 rounded-xl px-4 py-3 text-xs font-medium text-emerald-400 focus:outline-none focus:border-emerald-400 transition-all"
                        placeholder="Prevention tip"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 py-3 bg-white/8 text-white/50 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/12 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={updateScamMutation.isPending}
                        className="flex-2 py-3 bg-amber-400 text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-300 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20"
                    >
                        {updateScamMutation.isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Save size={14} />
                        )}
                        Save Alert
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className="bg-card rounded-2xl border border-white/8 shadow-sm overflow-hidden group hover:shadow-black/30 hover:shadow-md transition-all duration-300 flex flex-row relative cursor-pointer active:scale-[0.99]"
        >
            {/* Photo — left */}
            {alert.imageUrl && (
                <div className="relative w-36 shrink-0 overflow-hidden">
                    <img
                        src={alert.imageUrl}
                        alt={alert.scamName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Category pill moved into image */}
                    <div className="absolute top-3 left-3">
                        <span className="bg-red-500/80 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[8px] font-bold tracking-widest uppercase flex items-center gap-1 shadow-lg border border-red-400/20">
                            <AlertTriangle size={8} />
                            {alert.category?.name || 'Scam'}
                        </span>
                    </div>
                </div>
            )}

            {/* Content — right */}
            <div className="flex-1 p-5 flex flex-col gap-3 min-w-0">
                {/* Meta row - User at top left, Date at top right */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-white/8 rounded-lg flex items-center justify-center text-white/40">
                            <User size={10} />
                        </div>
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-tight">
                            {alert.user?.name || 'Local Expert'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {isOwner && (
                            <div className="flex items-center gap-2 mr-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsEditing(true);
                                    }}
                                    className="p-1.5 text-white/30 hover:text-amber-400 transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 size={12} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete();
                                    }}
                                    disabled={deleteScamMutation.isPending}
                                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Delete"
                                >
                                    {deleteScamMutation.isPending ? (
                                        <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={12} />
                                    )}
                                </button>
                            </div>
                        )}
                        <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="font-display text-lg font-bold text-foreground tracking-tight group-hover:text-red-400 transition-colors leading-tight">
                    {alert.scamName}
                </h3>

                {/* Description */}
                <p className="text-sm text-white/60 font-medium leading-relaxed line-clamp-2">
                    {alert.description}
                </p>

                {/* Prevention tip */}
                {alert.preventionTip && (
                    <p className="text-sm text-emerald-400 font-medium leading-relaxed line-clamp-2">
                        <span className="not-italic mr-1">💡</span>
                        {alert.preventionTip}
                    </p>
                )}

                {/* Footer */}
                <div className="mt-auto flex items-center justify-end pt-2 border-t border-white/8">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleVote(alert);
                        }}
                        disabled={votePending}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border',
                            alert.hasVoted
                                ? 'bg-red-400/10 border-red-400/20 text-red-400'
                                : 'border-white/10 text-white/30 hover:text-red-400 hover:border-red-400/20',
                        )}
                    >
                        <Heart size={12} fill={alert.hasVoted ? 'currentColor' : 'none'} />
                        {alert._count?.votes || 0}
                    </button>
                </div>
            </div>
        </div>
    );
}
