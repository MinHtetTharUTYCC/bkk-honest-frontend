'use client';

import { useRef, useState } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';


interface LocationPickerProps {
  onLocationSelected: (location: { latitude: number; longitude: number }) => void;
  initialLocation?: { latitude: number; longitude: number };
}

const BANGKOK_CENTER = { latitude: 13.7563, longitude: 100.5018 };
const DEFAULT_ZOOM = 13;

export default function LocationPicker({
  onLocationSelected,
  initialLocation }: LocationPickerProps) {
  const mapRef = useRef<unknown>(null);
  const [viewState, setViewState] = useState({
    latitude: initialLocation?.latitude ?? BANGKOK_CENTER.latitude,
    longitude: initialLocation?.longitude ?? BANGKOK_CENTER.longitude,
    zoom: DEFAULT_ZOOM,
    bearing: 0,
    pitch: 0 });

  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initialLocation ?? null);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [geolocationStatus, setGeolocationStatus] = useState<
    'idle' | 'requesting' | 'granted' | 'denied'
  >('idle');

  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const handleRequestGeolocation = () => {
    setGeolocationStatus('requesting');
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setGeolocationStatus('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setViewState((prev) => ({
          ...prev,
          latitude,
          longitude,
          zoom: DEFAULT_ZOOM }));
        setGeolocationStatus('granted');
      },
      (err) => {
        setGeolocationStatus('denied');
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please select your location on the map.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Your device could not determine your location. Please select on the map.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out. Please select your location on the map.');
            break;
          default:
            setError('Unable to access your location. Please select on the map.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 }
    );
  };

  const handleMapClick = (event: unknown) => {
    const { lngLat } = event;
    setSelectedLocation({ latitude: lngLat.lat, longitude: lngLat.lng });
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedLocation) return;

    setIsConfirming(true);
    try {
      onLocationSelected(selectedLocation);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedLocation) {
      handleConfirm();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-zinc-900/50 backdrop-blur">
        <h2 className="text-white font-bold text-lg tracking-tight">Select Location</h2>
        <p className="text-white/40 text-sm mt-1">
          {selectedLocation
            ? 'Tap confirm to save this location'
            : 'Click on map to select or use your current location'}
        </p>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        {MAPBOX_TOKEN ? (
          <Map
            ref={mapRef}
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            onClick={handleMapClick}
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            attributionControl={false}
            aria-label="Location selection map"
          >
            {/*  location marker (blue) */}
            {userLocation && (
              <Marker latitude={userLocation.latitude} longitude={userLocation.longitude}>
                <div
                  className="relative flex items-center justify-center"
                  aria-label={`Your location: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}
                >
                  <div className="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping" />
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </div>
              </Marker>
            )}

            {/* Selected location marker (amber) */}
            {selectedLocation && (
              <Marker latitude={selectedLocation.latitude} longitude={selectedLocation.longitude}>
                <div
                  className="w-8 h-8 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50 border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                  aria-label={`Selected location: ${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`}
                >
                  <MapPin size={16} className="text-amber-900" />
                </div>
              </Marker>
            )}
          </Map>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <p className="text-white/50 text-center">
              <span className="block font-bold mb-2">Map unavailable</span>
              <span className="text-xs">Mapbox token not configured</span>
            </p>
          </div>
        )}

        {/* Geolocation Button */}
        {geolocationStatus === 'idle' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleRequestGeolocation}
            type="button"
            className="absolute bottom-6 right-6 z-20 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-[0.95] flex items-center justify-center border border-blue-400/50"
            aria-label="Use current location"
            title="Use current location"
          >
            <Navigation size={20} fill="currentColor" />
          </motion.button>
        )}

        {/* Loading Indicator for Geolocation */}
        {geolocationStatus === 'requesting' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-6 right-6 z-20 p-3 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center"
          >
            <Loader size={20} className="animate-spin" />
          </motion.div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border-t border-red-500/30 p-4 flex items-start gap-3"
        >
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Footer */}
      <div className="p-6 border-t border-white/5 bg-zinc-900/50 backdrop-blur space-y-4">
        {selectedLocation ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Confirm Button */}
            <button
              type="button"
              onClick={handleConfirm}
              onKeyDown={handleKeyDown}
              disabled={isConfirming}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-gray-600 text-black disabled:text-white/50 py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] shadow-xl shadow-amber-400/20 disabled:shadow-none"
              aria-label="Confirm location selection"
            >
              {isConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={16} className="animate-spin" />
                  Confirming...
                </span>
              ) : (
                'Confirm Location'
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-4 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider">
                Select a location on the map
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
