import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import SearchableSpotSelect from '@/components/spots/searchable-spot-select';
import { cn } from '@/lib/utils';
import { priceFormValidation, type PriceFormData } from '@/lib/validations/price-form.validation';
import { getApiErrorMessage } from '@/lib/errors/api-error';

interface PriceFormProps {
    selectedCityId?: string;
    onSuccess: () => void;
    onError: (message: string) => void;
    isLoading: boolean;
    onSubmit: (data: PriceFormData) => Promise<void>;
}

export default function PriceForm({
    selectedCityId,
    onSuccess,
    onError,
    isLoading,
    onSubmit,
}: PriceFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<PriceFormData>({
        resolver: zodResolver(priceFormValidation),
    });

    const spotId = watch('spotId');
    const itemName = watch('itemName');

    const handleFormSubmit = async (data: PriceFormData) => {
        try {
            await onSubmit(data);
            onSuccess();
        } catch (err: unknown) {
            const message = getApiErrorMessage(err) || 'Failed to publish price report';
            console.error(message);
            onError(message);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            <SearchableSpotSelect
                name="spotId"
                required
                placeholder="Search spots..."
                cityId={selectedCityId}
                onSelect={(id) => setValue('spotId', id)}
            />
            {errors.spotId && <p className="text-xs text-red-400">{errors.spotId.message}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                        Item Name
                    </label>
                    <input
                        {...register('itemName')}
                        placeholder="e.g. Pad Thai"
                        className={cn(
                            'w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none',
                            (itemName?.length || 0) > 100 &&
                                'border-red-500/50 ring-1 ring-red-500/20',
                        )}
                    />
                    <div className="flex justify-between items-center">
                        {errors.itemName && (
                            <span className="text-xs text-red-400">{errors.itemName.message}</span>
                        )}
                        <span
                            className={cn(
                                'text-[9px] font-bold tracking-normal transition-colors ml-auto',
                                (itemName?.length || 0) > 100 ? 'text-red-400' : 'text-white/30',
                            )}
                        >
                            {itemName?.length || 0}/100
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                        Price (THB)
                    </label>
                    <input
                        {...register('priceThb', { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none"
                    />
                    {errors.priceThb && (
                        <p className="text-xs text-red-400">{errors.priceThb.message}</p>
                    )}
                </div>
            </div>

            <button
                disabled={isLoading || !spotId}
                className="w-full bg-amber-400 text-black py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-amber-300 transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-400/20 active:scale-[0.98] disabled:opacity-50"
            >
                <Send size={16} />
                {isLoading ? 'Publishing...' : 'Publish Price Report'}
            </button>
        </form>
    );
}
