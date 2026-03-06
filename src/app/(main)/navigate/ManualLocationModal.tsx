'use client';

import { useEffect, useRef, useState } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ManualLocationModalProps {
  destLat: number;
  destLng: number;
  destName: string;
  onLocationSelected: (lat: number, lng: number) => void;
  errorType: 'permission_denied' | 'timeout' | 'position_unavailable' | 'unknown';
}

export default function ManualLocationModal({
  destLat,
  destLng,
  destName,
  onLocationSelected,
  errorType,
}: ManualLocationModalProps) {
  const mapRef = useRef<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewState, setViewState] = useState({
    latitude: 13.7563,
    longitude: 100.5018,
    zoom: 13,
    bearing: 0,
    pitch: 0,
  });

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const getErrorMessage = () => {
    switch (errorType) {
      case 'permission_denied':
        return 'Location permission denied. Please mark your current location on the map to proceed.';
      case 'timeout':
        return 'Location request timed out. Please mark your current location on the map to proceed.';
      case 'position_unavailable':
        return 'Your device could not determine your location. Please mark your current location on the map to proceed.';
      default:
        return 'Unable to access your location. Please mark your current location on the map to proceed.';
    }
  };

  const handleMapClick = (event: any) => {
    const { lngLat } = event;
    setSelectedLocation({ lat: lngLat.lat, lng: lngLat.lng });
    setViewState((prev) => ({
      ...prev,
      latitude: lngLat.lat,
      longitude: lngLat.lng,
    }));
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelected(selectedLocation.lat, selectedLocation.lng);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 30 }}
        className="bg-gray-900 rounded-3xl overflow-hidden w-full max-w-md max-h-[90vh] flex flex-col border border-amber-400/20"
      >
        <div className="p-6 border-b border-border/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-white font-semibold mb-2">Mark Your Location</h2>
              <p className="text-white/60 text-sm">{getErrorMessage()}</p>
            </div>
          </div>
        </div>

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
            >
              {selectedLocation && (
                <Marker latitude={selectedLocation.lat} longitude={selectedLocation.lng}>
                  <div className="w-4 h-4 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50 border-2 border-white animate-pulse" />
                </Marker>
              )}

              <Marker latitude={destLat} longitude={destLng}>
                <div className="w-8 h-8 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50 border-2 border-white flex items-center justify-center">
                  <MapPin size={16} className="text-amber-900" />
                </div>
              </Marker>
            </Map>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <p className="text-white/50">Map not available</p>
            </div>
          )}

          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="text-center text-white/60 text-xs bg-black/40 px-3 py-2 rounded-full backdrop-blur">
              Click map to mark your location
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border/30 space-y-3">
          {selectedLocation ? (
            <>
              <div className="bg-white/5 rounded-2xl p-3 text-center">
                <p className="text-white/60 text-xs mb-1">Selected Location:</p>
                <p className="text-white text-sm font-medium">
                  {selectedLocation.lat.toFixed(4)}° N, {selectedLocation.lng.toFixed(4)}° E
                </p>
              </div>
              <button
                onClick={handleConfirm}
                className="w-full bg-amber-400 text-black px-4 py-3 rounded-2xl font-semibold hover:bg-amber-300 transition-colors active:scale-95"
              >
                Navigate from Here
              </button>
            </>
          ) : (
            <p className="text-white/40 text-sm text-center py-3">
              Tap on the map to select your location
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
