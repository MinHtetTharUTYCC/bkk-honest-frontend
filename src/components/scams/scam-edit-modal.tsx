'use client';
import OptimizedImage from '@/components/ui/OptimizedImage';
import type { ImageVariantsDto } from '@/api/generated/model';

import { useState, useRef } from 'react';
import { X, Loader2, Camera, Save } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cn } from '@/lib/utils';
import { useUpdateScamAlert, useCategories, useCities } from '@/hooks/use-api';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface ScamEditModalProps {
    alert: {
        id: string;
        scamName: string;
        description: string;
        preventionTip: string;
        categoryId?: string;
        cityId?: string;
        imageVariants?: ImageVariantsDto;
    };
    onClose: () => void;
}

interface NamedOption {
    id: string;
    name: string;
}

export default function ScamEditModal({ alert, onClose }: ScamEditModalProps) {
    const updateScamMutation = useUpdateScamAlert();
    const { data: categories } = useCategories();
    const { data: cities } = useCities();
    const categoryOptions = (categories ?? []) as NamedOption[];
    const cityOptions = (cities ?? []) as NamedOption[];

    const [editName, setEditName] = useState(alert.scamName ?? '');
    const [editDesc, setEditDesc] = useState(alert.description ?? '');
    const [editPrev, setEditPrev] = useState(alert.preventionTip ?? '');
    const [editCategory, setEditCategory] = useState(alert.categoryId ?? '');
    const [editCity, setEditCity] = useState(alert.cityId ?? '');
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editPreview, setEditPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpdate = async () => {
        try {
            await updateScamMutation.mutateAsync({
                id: alert.id,
                payload: {
                    scamName: editName,
                    description: editDesc,
                    preventionTip: editPrev,
                    categoryId: editCategory || undefined,
                    cityId: editCity || undefined,
                    image: editFile || undefined,
                },
            });
            onClose();
            toast.success('Scam alert updated');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update scam alert');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Image is too large', { description: 'Maximum size is 10MB' });
                return;
            }
            setEditFile(file);
            setEditPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative bg-card w-full max-w-2xl rounded-[32px] border border-white/8 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 md:p-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="font-display text-2xl font-bold text-foreground uppercase tracking-tight">
                            Edit Alert
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors"
                        >
                            <X size={24} className="text-white/40" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-6">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-32 h-32 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 transition-colors shrink-0 overflow-hidden relative group"
                            >
                                {editPreview ? (
                                    <img
                                        alt="Scam alert"
                                        src={editPreview}
                                        className="w-full h-full object-cover group-hover:opacity-50"
                                    />
                                ) : alert.imageVariants &&
                                  Object.values(alert.imageVariants).some((v) => v) ? (
                                    <OptimizedImage
                                        variants={alert.imageVariants as ImageVariantsDto}
                                        alt="Scam alert"
                                        fill
                                        className="w-full h-full object-cover group-hover:opacity-50"
                                    />
                                ) : (
                                    <Camera size={24} className="text-white/20" />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={20} className="text-amber-400" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleFileChange}
                            />

                            <div className="flex-1 space-y-4">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base font-semibold text-foreground focus:outline-none focus:border-amber-400 transition-all"
                                    placeholder="Scam name"
                                />
                                <div className="flex gap-3">
                                    <select
                                        value={editCategory}
                                        onChange={(e) => setEditCategory(e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground focus:outline-none focus:border-amber-400 transition-all"
                                    >
                                        {categoryOptions.map((cat) => (
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
                                        {cityOptions.map((city) => (
                                            <option key={city.id} value={city.id}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <Textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm font-medium text-foreground/70 focus:outline-none focus:border-amber-400 transition-all min-h-30 resize-none"
                            placeholder="Scam description"
                        />

                        <input
                            type="text"
                            value={editPrev}
                            onChange={(e) => setEditPrev(e.target.value)}
                            className="w-full bg-emerald-400/8 border border-emerald-400/15 rounded-xl px-4 py-3 text-sm font-medium text-emerald-400 focus:outline-none focus:border-emerald-400 transition-all"
                            placeholder="Prevention tip"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-white/8 text-white/50 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-white/12 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdate}
                            disabled={updateScamMutation.isPending}
                            className="flex-2 py-4 bg-amber-400 text-black rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-amber-300 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20"
                        >
                            {updateScamMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
