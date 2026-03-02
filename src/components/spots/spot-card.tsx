import { MapPin, Zap, ArrowRight, ImageIcon } from 'lucide-react';
import { components } from '@/types/api';
import Link from 'next/link';

export default function SpotCard({ spot }: { spot: any }) {
  const { name, category, address, priceStats, vibeStats, imageUrl, images } = spot;

  // Format category name
  const categoryName = (category as any)?.name || 'Category';
  
  // Get the display image
  const displayImage = imageUrl || (images && images.length > 0 ? images[0].url : null);

  return (
    <div className="flex-shrink-0 w-full bg-white rounded-[32px] p-6 border border-gray-200 shadow-xl shadow-gray-200/40 group hover:scale-[1.01] transition-all duration-500">
      {/* Image Section */}
      <div className="relative w-full h-52 mb-6 rounded-[24px] overflow-hidden bg-gray-100 border border-gray-200">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
            <ImageIcon size={32} strokeWidth={1.5} />
            <span className="text-[9px] font-black uppercase tracking-widest">No Photos</span>
          </div>
        )}
        
        {/* Badge Container - Fixed overlapping and height */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="bg-white/95 backdrop-blur-md text-gray-900 px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase shadow-sm border border-white/20">
            {categoryName}
          </span>
          <div className="bg-emerald-500/95 backdrop-blur-md text-white px-3 py-1.5 rounded-xl flex items-center gap-1 font-black text-[9px] tracking-widest uppercase shadow-lg shadow-emerald-500/20 border border-emerald-400/20">
            <Zap size={10} fill="currentColor" />
            {(vibeStats as any)?.avgCrowdLevel ? `${((vibeStats as any).avgCrowdLevel / 5 * 100).toFixed(0)}% Trust` : 'New'}
          </div>
        </div>
      </div>

      <div className="space-y-1 mb-5">
        <h3 className="text-xl font-black text-gray-900 leading-tight line-clamp-1 italic uppercase tracking-tighter">{name}</h3>
        <p className="text-gray-400 font-bold text-[9px] uppercase tracking-widest flex items-center gap-1.5 line-clamp-1">
          <MapPin size={11} className="text-cyan-400" />
          {address?.split(',')[0]}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-50/80 p-3.5 rounded-[20px] border border-gray-200/60">
          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">
            Avg Price
          </span>
          <span className="text-sm font-black text-gray-900 tracking-tighter italic">
            {(priceStats as any)?.avg ? `${(priceStats as any).avg} THB` : '--'}
          </span>
        </div>
        <div className="bg-gray-50/80 p-3.5 rounded-[20px] border border-gray-200/60">
          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">
            Pulse
          </span>
          <span className="text-sm font-black text-gray-900 tracking-tighter italic">
            {(priceStats as any)?.count || 0} Reports
          </span>
        </div>
      </div>

      <Link 
        href={`/spots/${spot.id}`}
        className="w-full bg-gray-900 text-white py-3.5 rounded-[20px] text-[9px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center gap-2 group-hover:gap-3"
      >
        Explore Full Guide
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
