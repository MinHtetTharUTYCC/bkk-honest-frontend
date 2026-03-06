'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, ArrowLeft, Loader2, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ManualLocationModal from './ManualLocationModal';

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

export default function NavigatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const destLat = parseFloat(searchParams.get('lat') || '0');
  const destLng = parseFloat(searchParams.get('lng') || '0');
  const destName = searchParams.get('name') || 'Destination';

  const [viewState, setViewState] = useState({
    latitude: DEFAULT_CENTER.lat,
    longitude: DEFAULT_CENTER.lng,
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
  const mapRef = useRef<any>(null);

  useEffect(() => {
    checkGeolocationPermission();
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
      }
    );
  };

  const fetchRoute = async (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${fromLng},${fromLat};${toLng},${toLat}?alternatives=false&steps=true&geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`
      );

      if (!response.ok) throw new Error('Failed to fetch route');

      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        setRoute(data.routes[0]);
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

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {MAPBOX_TOKEN ? (
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
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
        </Map>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <div className="text-center space-y-4">
            <MapPin size={32} className="text-white/50 mx-auto" />
            <p className="text-white/50">Map not available</p>
          </div>
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-transparent p-4 z-20">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white hover:text-amber-400 transition-colors"
            title="Back"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="text-center flex-1">
            <h2 className="text-white font-semibold truncate px-4">{destName}</h2>
            {route && !isLoading && (
              <div className="text-white/60 text-xs mt-1">
                {calculateDistance()} • {calculateETA()}
              </div>
            )}
          </div>

          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Exit"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDirections && route && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="absolute bottom-0 left-0 right-0 bg-card rounded-3xl rounded-b-none max-h-[60vh] overflow-hidden z-30 border-t border-border"
          >
            <div className="p-4 border-b border-border/50 cursor-pointer flex items-center justify-between"
              onClick={() => setShowDirections(false)}>
              <div className="flex-1 text-center">
                <h3 className="text-white font-semibold">Directions</h3>
              </div>
              <ChevronDown size={20} className="text-white/50" />
            </div>

            <div className="overflow-y-auto max-h-[55vh] p-4 space-y-3">
              {route.steps && route.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-black font-semibold text-xs">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{step.maneuver.instruction}</p>
                    <p className="text-white/50 text-xs mt-1">
                      {(step.distance / 1000).toFixed(2)} km • {Math.ceil(step.duration / 60)} min
                    </p>
                  </div>
                </div>
              ))}
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
        <motion.button
          onClick={() => setShowDirections(true)}
          className="absolute bottom-6 left-6 right-6 bg-amber-400 text-black px-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-amber-300 transition-all active:scale-95 shadow-xl z-20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View Turn-by-Turn Directions
        </motion.button>
      )}

      <AnimatePresence>
        {showManualLocation && permissionError && (
          <ManualLocationModal
            destLat={destLat}
            destLng={destLng}
            destName={destName}
            onLocationSelected={handleManualLocationSelected}
            errorType={permissionError}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
