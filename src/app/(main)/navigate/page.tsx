'use client';
import { Suspense } from 'react';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, ArrowLeft, Loader2, X, ChevronDown, Train } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ManualLocationModal from './ManualLocationModal';
import TransitOverlay from '@/components/map/transit-overlay';
import { useMapTransitVisible } from '@/hooks/use-map-transit';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const DEFAULT_CENTER = { lat: 13.7563, lng: 100.5018 };

type PermissionErrorType = 'permission_denied' | 'timeout' | 'position_unavailable' | 'unknown';

interface RouteStep {
    distance: number;
    duration: number;
    maneuver: {
        instruction: string;
        bearing_after: number;
    };
}

interface Route {
    distance: number;
    duration: number;
    steps?: RouteStep[];
    geometry: {
        type: 'LineString';
        coordinates: [number, number][];
    };
}

function NavigatePageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const destLat = parseFloat(searchParams.get('lat') || '0');
    const destLng = parseFloat(searchParams.get('lng') || '0');
    const destName = searchParams.get('name') || 'Destination';

    const [viewState, setViewState] = useState({
        latitude: destLat !== 0 ? destLat : DEFAULT_CENTER.lat,
        longitude: destLng !== 0 ? destLng : DEFAULT_CENTER.lng,
        zoom: 14,
        bearing: 0,
        pitch: 0,
    });

    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [route, setRoute] = useState<Route | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDirections, setShowDirections] = useState(false);
    const [showManualLocation, setShowManualLocation] = useState(false);
    const [permissionError, setPermissionError] = useState<PermissionErrorType | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const { transitVisible, toggleTransitVisible, hasHydrated } = useMapTransitVisible();

    const mapRef = useRef<any>(null);

    useEffect(() => {
        checkGeolocationPermission();
        // Lock body scroll while navigation page is mounted
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [destLat, destLng]);

    const checkGeolocationPermission = async () => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            setIsLoading(false);
            return;
        }

        if (!navigator.permissions) {
            // Fallback: just try geolocation if permissions API not available
            attemptGeolocation();
            return;
        }

        try {
            const permissionStatus = await navigator.permissions.query({
                name: 'geolocation' as PermissionName,
            });

            if (permissionStatus.state === 'denied') {
                setShowManualLocation(true);
                setPermissionError('permission_denied');
                setIsLoading(false);
            } else {
                attemptGeolocation();
            }
        } catch (err) {
            // Fallback if permissions API fails
            attemptGeolocation();
        }
    };

    const attemptGeolocation = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                setViewState((prev) => ({
                    ...prev,
                    latitude,
                    longitude,
                }));
                fetchRoute(latitude, longitude, destLat, destLng);
            },
            (err) => {
                console.error('Geolocation error:', err);
                let errorType: PermissionErrorType = 'unknown';

                if (err.code === 1) {
                    errorType = 'permission_denied';
                } else if (err.code === 3) {
                    errorType = 'timeout';
                } else if (err.code === 2) {
                    errorType = 'position_unavailable';
                }

                setPermissionError(errorType);
                setShowManualLocation(true);
                setIsLoading(false);
            },
            {
                timeout: 10000,
                enableHighAccuracy: false,
            },
        );
    };

    const fetchRoute = async (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${fromLng},${fromLat};${toLng},${toLat}?alternatives=false&steps=true&geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`,
            );

            if (!response.ok) throw new Error('Failed to fetch route');

            const data = await response.json();
            if (data.routes && data.routes.length > 0) {
                const mainRoute = data.routes[0];
                setRoute({
                    ...mainRoute,
                    steps: mainRoute.legs?.[0]?.steps || [],
                });
            } else {
                setError('No route found');
            }
        } catch (err) {
            console.error('Route fetch error:', err);
            setError('Failed to calculate route');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseManualLocation = () => {
        setShowManualLocation(false);
        router.back();
    };

    const handleManualLocationSelected = (lat: number, lng: number) => {
        setUserLocation({ lat, lng });
        setViewState((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
        }));
        setShowManualLocation(false);
        setPermissionError(null);
        fetchRoute(lat, lng, destLat, destLng);
    };

    const calculateETA = () => {
        if (!route) return null;
        const minutes = Math.ceil(route.duration / 60);
        const hours = Math.floor(minutes / 60);
        return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
    };

    const calculateDistance = () => {
        if (!route) return null;
        const km = (route.distance / 1000).toFixed(1);
        return `${km} km`;
    };

    const getExternalMapUrl = (destLat: number, destLng: number, startLat?: number, startLng?: number) => {
        if (typeof window === 'undefined') return '';
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        if (isIOS) {
            // Apple Maps link
            const origin = startLat && startLng ? `&saddr=${startLat},${startLng}` : '';
            return `maps://?daddr=${destLat},${destLng}${origin}`;
        }
        
        // Google Maps Universal Link
        const origin = startLat && startLng ? `&origin=${startLat},${startLng}` : '';
        return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}${origin}`;
    };

    const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

    return (
        <div className="fixed top-16 md:top-20 left-0 md:left-20 right-0 bottom-0 overflow-hidden bg-black">
            {MAPBOX_TOKEN ? (
                <Map
                    ref={mapRef}
                    {...viewState}
                    onMove={(evt) => setViewState(evt.viewState)}
                    onLoad={() => setMapLoaded(true)}
                    mapboxAccessToken={MAPBOX_TOKEN}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/dark-v11"
                >
                    {userLocation && (
                        <Marker latitude={userLocation.lat} longitude={userLocation.lng}>
                            <div className="w-3 h-3 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50 border-2 border-white" />
                        </Marker>
                    )}

                    <Marker latitude={destLat} longitude={destLng}>
                        <div className="w-8 h-8 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50 border-2 border-white flex items-center justify-center">
                            <MapPin size={16} className="text-amber-900" />
                        </div>
                    </Marker>

                    {route && (
                        <Source
                            id="route"
                            type="geojson"
                            data={{
                                type: 'Feature',
                                properties: {},
                                geometry: route.geometry,
                            }}
                        >
                            <Layer
                                id="route-line"
                                type="line"
                                paint={{
                                    'line-color': '#FBBF24',
                                    'line-width': 5,
                                    'line-opacity': 0.8,
                                }}
                            />
                        </Source>
                    )}

                    {/* Transit Overlay */}
                    {mapLoaded && <TransitOverlay visible={transitVisible} zoom={viewState.zoom} />}
                </Map>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <div className="text-center space-y-4">
                        <MapPin size={32} className="text-white/50 mx-auto" />
                        <p className="text-white/50">Map not available</p>
                    </div>
                </div>
            )}

            <div className="absolute top-0 left-0 right-0 bg-linear-to-b from-gray-900 to-transparent p-4 z-20">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white hover:text-amber-400 transition-colors"
                        title="Back"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="text-center flex-1 min-w-0">
                        <h2 className="text-white font-semibold truncate px-2">{destName}</h2>
                        {route && !isLoading && (
                            <div className="text-white/60 text-xs mt-1">
                                {calculateDistance()} • {calculateETA()}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Transit Toggle - Only in BKK */}
                        <AnimatePresence>
                            {(viewState.latitude >= 13.4 && viewState.latitude <= 14.2 && 
                              viewState.longitude >= 100.2 && viewState.longitude <= 101.0 &&
                              viewState.zoom >= 10) && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={toggleTransitVisible}
                                    title={(hasHydrated && transitVisible) ? 'Hide transit lines' : 'Show transit lines'}
                                    aria-label={
                                        (hasHydrated && transitVisible)
                                            ? 'Hide Bangkok BTS/MRT transit overlay'
                                            : 'Show Bangkok BTS/MRT transit overlay'
                                    }
                                    aria-pressed={hasHydrated && transitVisible}
                                    className={cn(
                                        'p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-black',
                                        (hasHydrated && transitVisible)
                                            ? 'bg-amber-500/20 text-amber-400'
                                            : 'hover:bg-white/10 text-white/60 hover:text-amber-400',
                                    )}
                                >
                                    <Train size={18} />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            title="Exit"
                        >
                            <X size={20} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showDirections && route && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30 }}
                        className="absolute bottom-20 md:bottom-0 left-0 right-0 bg-card rounded-3xl rounded-b-none md:rounded-b-none max-h-[60vh] overflow-hidden z-30 border-t border-border"
                    >
                        <div
                            className="p-4 border-b border-border/50 cursor-pointer flex items-center justify-between"
                            onClick={() => setShowDirections(false)}
                        >
                            <div className="flex-1 text-center">
                                <h3 className="text-white font-semibold">Directions</h3>
                            </div>
                            <ChevronDown size={20} className="text-white/50" />
                        </div>

                        <div className="overflow-y-auto max-h-[55vh] p-4 space-y-3">
                            {route.steps && route.steps.length > 0 ? (
                                route.steps.map((step, idx) => (
                                    <div key={idx} className="flex gap-3 text-sm">
                                        <div className="shrink-0 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-black font-semibold text-xs">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">
                                                {step.maneuver.instruction}
                                            </p>
                                            <p className="text-white/50 text-xs mt-1">
                                                {(step.distance / 1000).toFixed(2)} km •{' '}
                                                {Math.ceil(step.duration / 60)} min
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-10 text-center space-y-2">
                                    <p className="text-white font-medium">No detailed instructions</p>
                                    <p className="text-white/40 text-xs">Follow the path on the map for this short route.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
                    <div className="text-center space-y-4">
                        <Loader2 size={32} className="text-amber-400 animate-spin mx-auto" />
                        <p className="text-white">Calculating route...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute top-20 left-4 right-4 bg-red-500/20 border border-red-500/50 rounded-2xl p-4 z-20">
                    <p className="text-red-300 text-sm">{error}</p>
                </div>
            )}

            {!showDirections && route && !isLoading && (
                <div className="absolute bottom-24 md:bottom-8 left-6 right-6 flex gap-3 z-20">
                    <motion.button
                        onClick={() => setShowDirections(true)}
                        className="flex-1 bg-white/10 backdrop-blur-md text-white px-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/10"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Directions
                    </motion.button>
                    
                    <motion.button
                        onClick={() => {
                            const url = getExternalMapUrl(destLat, destLng, userLocation?.lat, userLocation?.lng);
                            window.open(url, '_blank');
                        }}
                        className="flex-1 bg-amber-400 text-black px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-300 transition-all shadow-xl shadow-amber-400/20"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isIOS ? 'Apple Maps' : 'Google Maps'}
                    </motion.button>
                </div>
            )}

            <AnimatePresence>
                {showManualLocation && permissionError && (
                    <ManualLocationModal
                        destLat={destLat}
                        destLng={destLng}
                        destName={destName}
                        onLocationSelected={handleManualLocationSelected}
                        onClose={handleCloseManualLocation}
                        errorType={permissionError}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}


export default function NavigatePage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-screen bg-white/5 rounded-2xl m-4" />}>
      <NavigatePageContent  />
    </Suspense>
  );
}
