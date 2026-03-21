'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Map, { Marker, ViewState, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNearbySpots, usePopularArea, useCategories } from '@/hooks/use-api';
import { Loader2, Navigation, Heart, Zap, Info, MapPin, X, Utensils, Music, ShoppingBag, Bed, Coffee, Ticket, Train } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getSpotUrl } from '@/lib/slug';
import TransitOverlay from '@/components/map/transit-overlay';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Default to Asok if absolutely nothing works
const DEFAULT_CENTER = {
  latitude: 13.736717,
  longitude: 100.561111,
  zoom: 14
};

const CATEGORY_COLORS: Record<string, string> = {
  'food': 'text-amber-500 bg-amber-500/20 border-amber-500',
  'nightlife': 'text-purple-500 bg-purple-500/20 border-purple-500',
  'market': 'text-emerald-500 bg-emerald-500/20 border-emerald-500',
  'accommodation': 'text-blue-500 bg-blue-500/20 border-blue-500',
  'attraction': 'text-rose-500 bg-rose-500/20 border-rose-500',
  'cafe': 'text-orange-500 bg-orange-500/20 border-orange-500',
  'default': 'text-white/80 bg-white/20 border-white/40'
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'food': <Utensils size={14} />,
  'nightlife': <Music size={14} />,
  'market': <ShoppingBag size={14} />,
  'accommodation': <Bed size={14} />,
  'attraction': <Ticket size={14} />,
  'cafe': <Coffee size={14} />,
  'default': <MapPin size={14} />
};

export default function MapPage() {
  const router = useRouter();
  const urlParams = useSearchParams();
  const mapRef = useRef<MapRef>(null);

  // Read initial state from URL (restores state when coming back from spot page)
  const urlLat = parseFloat(urlParams.get('lat') || '');
  const urlLng = parseFloat(urlParams.get('lng') || '');
  const urlZoom = parseFloat(urlParams.get('zoom') || '');
  const urlCat = urlParams.get('cat') || undefined;
  const hasUrlPosition = !isNaN(urlLat) && !isNaN(urlLng);

  const initialCenter = hasUrlPosition
    ? { latitude: urlLat, longitude: urlLng, zoom: isNaN(urlZoom) ? DEFAULT_CENTER.zoom : urlZoom }
    : DEFAULT_CENTER;

  const [viewState, setViewState] = useState<ViewState>({
    latitude: initialCenter.latitude,
    longitude: initialCenter.longitude,
    zoom: initialCenter.zoom,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(urlCat);
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [transitVisible, setTransitVisible] = useState(false);
  // Skip geolocation if we already have a position from URL (returning user)
  const [hasRequestedLocation, setHasRequestedLocation] = useState(hasUrlPosition);
  // Flag: set when user switches category so next spot load triggers auto-fit if needed
  const shouldAutoFit = useRef(false);

  const [searchParams, setSearchParams] = useState({
    latitude: initialCenter.latitude,
    longitude: initialCenter.longitude,
    zoom: initialCenter.zoom
  });

  // Data Fetching
  const { data: categories } = useCategories();
  const { data: popularArea } = usePopularArea();

  // Snap coordinate to ~1km grid to avoid cache-key churn on tiny moves
  const snapCoord = (v: number) => Math.round(v * 100) / 100;

  // Compute search radius and result limit based on zoom level
  const getSearchConfig = (zoom: number): { distance: number; limit?: number } => {
    if (zoom > 14) return { distance: 3 };
    if (zoom > 12) return { distance: 5 };
    if (zoom > 10) return { distance: 15, limit: 15 };
    return { distance: 30, limit: 10 };
  };

  const searchConfig = getSearchConfig(searchParams.zoom);

  // Only show zoom warning at very wide views
  const isVeryZoomedOut = viewState.zoom <= 10;

  const { data: spots, isFetching: spotsFetching } = useNearbySpots({
    latitude: searchParams.latitude,
    longitude: searchParams.longitude,
    distance: searchConfig.distance,
    categoryId: activeCategoryId,
    limit: searchConfig.limit,
  });

  // Build and sync map state to URL (router.replace keeps history clean)
  const syncUrl = (lat: number, lng: number, zoom: number, cat?: string) => {
    const params = new URLSearchParams();
    params.set('lat', snapCoord(lat).toString());
    params.set('lng', snapCoord(lng).toString());
    params.set('zoom', Math.round(zoom * 10) / 10 + '');
    if (cat) params.set('cat', cat);
    router.replace(`/map?${params.toString()}`);
  };

  // Sync searchParams when map move ends — always update, snapping coords to ~1km grid
  const handleMoveEnd = (evt: any) => {
    const lat = snapCoord(evt.viewState.latitude);
    const lng = snapCoord(evt.viewState.longitude);
    const zoom = evt.viewState.zoom;
    setSearchParams({ latitude: lat, longitude: lng, zoom });
    syncUrl(lat, lng, zoom, activeCategoryId);
    // Deactivate Near Me if user panned significantly away from their location
    if (nearMeActive && userLocation) {
      const dist = Math.abs(lat - userLocation.lat) + Math.abs(lng - userLocation.lng);
      if (dist > 0.02) setNearMeActive(false);
    }
  };

  // Lock body scroll while map page is mounted
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // After a category switch, auto-fit map to new spots if they're outside current viewport
  useEffect(() => {
    if (!shouldAutoFit.current || spotsFetching || !spots || !mapRef.current) return;
    shouldAutoFit.current = false;

    if (spots.length === 0) return;

    const bounds = mapRef.current.getBounds();
    const anyVisible = spots.some((s: any) => bounds?.contains([s.longitude, s.latitude]));

    if (!anyVisible) {
      const lngs = spots.map((s: any) => s.longitude as number);
      const lats = spots.map((s: any) => s.latitude as number);
      mapRef.current.fitBounds(
        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
        { padding: 80, maxZoom: 15, duration: 900 }
      );
    }
  }, [spots, spotsFetching]);

  // Handle Initial Location
  useEffect(() => {
    if (hasRequestedLocation) return;
    
    setHasRequestedLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setNearMeActive(true);
          setViewState(prev => ({ ...prev, latitude, longitude, zoom: 15 }));
          setSearchParams({ latitude, longitude, zoom: 15 });
          syncUrl(latitude, longitude, 15, activeCategoryId);
        },
        (error) => {
          console.warn('Geolocation blocked or failed. Using fallback.', error);
          if (popularArea) {
            setViewState(prev => ({ 
              ...prev, 
              latitude: popularArea.latitude, 
              longitude: popularArea.longitude,
              zoom: 14
            }));
            setSearchParams({ 
              latitude: popularArea.latitude, 
              longitude: popularArea.longitude, 
              zoom: 14 
            });
            syncUrl(popularArea.latitude, popularArea.longitude, 14, activeCategoryId);
          }
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else if (popularArea) {
      setViewState(prev => ({ 
        ...prev, 
        latitude: popularArea.latitude, 
        longitude: popularArea.longitude,
        zoom: 14
      }));
      setSearchParams({ 
        latitude: popularArea.latitude, 
        longitude: popularArea.longitude, 
        zoom: 14 
      });
      syncUrl(popularArea.latitude, popularArea.longitude, 14, activeCategoryId);
    }
  }, [hasRequestedLocation, popularArea]);

  const handleNavigate = () => {
    if (!selectedSpot) return;
    router.push(`/navigate?lat=${selectedSpot.latitude}&lng=${selectedSpot.longitude}&name=${encodeURIComponent(selectedSpot.name)}`);
  };

  const handleNearMe = () => {
    if (!('geolocation' in navigator)) return;

    if (userLocation) {
      // Already have location — fly back to it and re-center fetch
      mapRef.current?.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 15, duration: 800 });
      setSearchParams({ latitude: userLocation.lat, longitude: userLocation.lng, zoom: 15 });
      syncUrl(userLocation.lat, userLocation.lng, 15, activeCategoryId);
      setNearMeActive(true);
    } else {
      // Request geolocation for the first time
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setNearMeActive(true);
          mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 15, duration: 800 });
          setSearchParams({ latitude, longitude, zoom: 15 });
          syncUrl(latitude, longitude, 15, activeCategoryId);
        },
        (error) => {
          console.warn('Geolocation denied or failed', error);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  };

  const getCategoryConfig = (slug: string) => {
    return {
      colors: CATEGORY_COLORS[slug?.toLowerCase()] || CATEGORY_COLORS['default'],
      icon: CATEGORY_ICONS[slug?.toLowerCase()] || CATEGORY_ICONS['default']
    };
  };

  if (!MAPBOX_TOKEN) {
    return <div className="p-8 text-center text-red-400">Mapbox token missing in .env.local</div>;
  }

  return (
    <div className="fixed top-16 md:top-20 left-0 md:left-20 right-0 bottom-0 overflow-hidden bg-black">
      
      {/* MAP LAYER */}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        reuseMaps
      >
        {/* User Location Pulse */}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-8 h-8 bg-cyan-500/30 rounded-full animate-ping" />
              <div className="w-4 h-4 bg-cyan-500 rounded-full border-2 border-black shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
            </div>
          </Marker>
        )}

        {/* Spot Markers */}
        {spots?.map((spot: any) => {
          const config = getCategoryConfig(spot.category_name);
          const isSelected = selectedSpot?.id === spot.id;

          return (
            <Marker 
              key={spot.id} 
              longitude={spot.longitude} 
              latitude={spot.latitude} 
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setSelectedSpot(spot);
                
                // Fly to spot
                mapRef.current?.flyTo({
                  center: [spot.longitude, spot.latitude],
                  zoom: Math.max(viewState.zoom, 15),
                  duration: 800
                });
              }}
            >
              <div className={cn(
                "group relative flex flex-col items-center cursor-pointer transition-transform duration-300",
                isSelected ? "scale-125 z-50" : "hover:scale-110 z-10"
              )}>
                {/* Marker Pin */}
                <div className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg backdrop-blur-md transition-all",
                  "text-amber-400 bg-amber-500/20 border-amber-500",
                  isSelected ? "shadow-[0_0_20px_theme(colors.amber.400)] border-white" : ""
                )}>
                  {config.icon}
                </div>
                {/* Little triangle tail */}
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-amber-500 mt-[-1px]" />
              </div>
            </Marker>
          );
        })}
        
        {/* Transit Overlay */}
        <TransitOverlay visible={transitVisible} zoom={viewState.zoom} />
      </Map>

      {/* NEAR ME TOGGLE — top right */}
      <button
        onClick={handleNearMe}
        title="Near Me"
        className={cn(
          "absolute top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all shadow-xl",
          nearMeActive
            ? "bg-cyan-500 text-black shadow-cyan-500/40"
            : "bg-black/60 backdrop-blur-md border border-white/10 text-white/60 hover:text-cyan-400 hover:border-cyan-400/40"
        )}
      >
        <Navigation size={14} className={nearMeActive ? "fill-black" : ""} />
        Near Me
      </button>

      {/* TRANSIT TOGGLE — below Near Me */}
      <AnimatePresence>
        {(viewState.latitude >= 13.4 && viewState.latitude <= 14.2 && 
          viewState.longitude >= 100.2 && viewState.longitude <= 101.0 &&
          viewState.zoom >= 10) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setTransitVisible(!transitVisible)}
            title={transitVisible ? "Hide transit lines" : "Show transit lines"}
            aria-label={transitVisible ? "Hide Bangkok BTS/MRT transit overlay" : "Show Bangkok BTS/MRT transit overlay"}
            aria-pressed={transitVisible}
            className={cn(
              "absolute top-16 right-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-black",
              transitVisible
                ? "bg-amber-500 text-black shadow-amber-500/40"
                : "bg-black/60 backdrop-blur-md border border-white/10 text-white/60 hover:text-amber-400 hover:border-amber-400/40"
            )}
          >
            <Train size={14} />
            Transit
          </motion.button>
        )}
      </AnimatePresence>

      {/* TOP FILTER BAR */}
      <div className="absolute top-4 left-0 right-28 z-40 px-4">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x">
          <button
            onClick={() => {
              setActiveCategoryId(undefined);
              shouldAutoFit.current = true;
              syncUrl(searchParams.latitude, searchParams.longitude, searchParams.zoom, undefined);
            }}
            className={cn(
              "whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-xl snap-center flex items-center gap-2",
              !activeCategoryId 
                ? "bg-white text-black shadow-white/20 scale-105" 
                : "bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/10"
            )}
          >
            All Spots
            {spotsFetching && !activeCategoryId && <Loader2 size={12} className="animate-spin" />}
          </button>
          
          {categories?.map((cat: any) => {
            const isSelected = activeCategoryId === cat.id;
            const config = getCategoryConfig(cat.name);
            
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategoryId(cat.id);
                  shouldAutoFit.current = true;
                  syncUrl(searchParams.latitude, searchParams.longitude, searchParams.zoom, cat.id);
                }}
                className={cn(
                  "whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-xl snap-center flex items-center gap-2",
                  isSelected 
                    ? `bg-white text-black scale-105` 
                    : "bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/10"
                )}
              >
                <span className={isSelected ? "text-black" : config.colors.split(' ')[0]}>
                  {config.icon}
                </span>
                {cat.name}
                {spotsFetching && isSelected && <Loader2 size={12} className="animate-spin" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ZOOM WARNING */}
      <AnimatePresence>
        {isVeryZoomedOut && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-black/80 backdrop-blur-md border border-amber-500/30 text-amber-400 px-4 py-2 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2"
          >
            <Info size={14} />
            Zoom in to see more spots
          </motion.div>
        )}
      </AnimatePresence>

      {/* NO SPOTS EMPTY STATE */}
      <AnimatePresence>
        {!spotsFetching && spots !== undefined && spots.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 bg-zinc-900/90 backdrop-blur-md border border-white/10 text-white/70 px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl flex items-center gap-2 whitespace-nowrap"
          >
            <MapPin size={15} className="text-amber-400 shrink-0" />
            No spots found in this area
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING BOTTOM SHEET FOR SELECTED SPOT */}
      <AnimatePresence>
        {selectedSpot && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-16 md:bottom-0 left-0 right-0 z-50 p-4 md:p-6 pb-safe"
          >
            <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl max-w-md mx-auto">
              {/* Spot Image */}
              {selectedSpot.imageUrl && (
                <div className="w-full h-40 rounded-2xl overflow-hidden mb-4 bg-white/5">
                  <img
                    src={selectedSpot.imageUrl}
                    alt={selectedSpot.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm",
                      getCategoryConfig(selectedSpot.category_name).colors
                    )}>
                      {selectedSpot.category_name}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight">
                    {selectedSpot.name}
                  </h3>
                  <p className="text-sm text-white/50 mt-1 line-clamp-1">
                    {selectedSpot.address}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedSpot(null)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
                  <Heart size={16} className="text-emerald-400 mb-1" />
                  <span className="text-[10px] text-white/50 uppercase font-semibold">Tips</span>
                  <span className="text-sm font-bold text-white">{selectedSpot.community_tips_count || 0}</span>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
                  <Zap size={16} className="text-amber-400 mb-1" />
                  <span className="text-[10px] text-white/50 uppercase font-semibold">Vibes</span>
                  <span className="text-sm font-bold text-white">{selectedSpot.vibe_checks_count || 0}</span>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
                  <MapPin size={16} className="text-cyan-400 mb-1" />
                  <span className="text-[10px] text-white/50 uppercase font-semibold">Reports</span>
                  <span className="text-sm font-bold text-white">{selectedSpot.price_reports_count || 0}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => router.push(getSpotUrl(selectedSpot?.city?.slug || 'bangkok', selectedSpot?.slug || ''))}
                  className="flex-1 bg-white/10 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-white/15 transition-colors border border-white/10 text-center"
                >
                  View Details
                </button>
                <button 
                  onClick={handleNavigate}
                  className="flex-1 bg-cyan-500 text-black font-bold py-3.5 rounded-xl text-sm hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                  <Navigation size={16} className="fill-black" />
                  Navigate
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
