"use client";

import { useRef, useState } from "react";
import Map, { Marker, MapRef, MapMouseEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, AlertCircle, X } from "lucide-react";
import { motion } from "framer-motion";

interface ManualLocationModalProps {
  destLat: number;
  destLng: number;
  destName: string;
  onLocationSelected: (lat: number, lng: number) => void;
  onClose?: () => void;
  errorType:
    | "permission_denied"
    | "timeout"
    | "position_unavailable"
    | "unknown";
}

export default function ManualLocationModal({
  destLat,
  destLng,

  onLocationSelected,
  onClose,
  errorType,
}: ManualLocationModalProps) {
  const mapRef = useRef<MapRef>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [viewState, setViewState] = useState({
    latitude: destLat !== 0 ? destLat : 13.7563,
    longitude: destLng !== 0 ? destLng : 100.5018,
    zoom: 13,
    bearing: 0,
    pitch: 0,
  });

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const getErrorMessage = () => {
    switch (errorType) {
      case "permission_denied":
        return "Location permission denied. Please mark your current location on the map to proceed.";
      case "timeout":
        return "Location request timed out. Please mark your current location on the map to proceed.";
      case "position_unavailable":
        return "Your device could not determine your location. Please mark your current location on the map to proceed.";
      default:
        return "Unable to access your location. Please mark your current location on the map to proceed.";
    }
  };

  const handleMapClick = (event: MapMouseEvent) => {
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

  const isIOS =
    typeof window !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 30 }}
        className="bg-zinc-900 rounded-[32px] overflow-hidden w-full max-w-lg h-[80vh] flex flex-col border border-white/10 shadow-2xl shadow-black"
      >
        <div className="p-6 border-b border-white/5 bg-zinc-900/50 backdrop-blur">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-400/10 rounded-2xl flex items-center justify-center text-amber-400 shrink-0">
              <AlertCircle size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-white font-bold text-lg tracking-tight">
                Set Your Starting Point
              </h2>
              <p className="text-white/50 text-xs leading-relaxed mt-1">
                {getErrorMessage()}
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                aria-label="Close dialog"
              >
                <X size={20} className="text-white/70 hover:text-white" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 relative">
          {MAPBOX_TOKEN ? (
            <Map
              ref={mapRef}
              {...viewState}
              onMove={(evt) => setViewState(evt.viewState)}
              onClick={handleMapClick}
              mapboxAccessToken={MAPBOX_TOKEN}
              style={{ width: "100%", height: "100%" }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
            >
              {selectedLocation && (
                <Marker
                  latitude={selectedLocation.lat}
                  longitude={selectedLocation.lng}
                >
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping" />
                    <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  </div>
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

          <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-full shadow-2xl">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-white font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">
                Tap anywhere to mark start
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-zinc-900/50 backdrop-blur space-y-4">
          <div className="flex flex-col gap-3">
            {selectedLocation && (
              <button
                onClick={handleConfirm}
                className="w-full bg-amber-400 text-black py-4 rounded-2xl font-bold text-sm hover:bg-amber-300 transition-all active:scale-[0.98] shadow-xl shadow-amber-400/20"
              >
                Navigate from This Point
              </button>
            )}
            <button
              onClick={() => {
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                const url = isIOS
                  ? `maps://?daddr=${destLat},${destLng}`
                  : `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
                window.open(url, "_blank");
              }}
              className="w-full bg-white/5 text-white/70 py-4 rounded-2xl font-bold text-sm hover:bg-white/10 hover:text-white transition-all active:scale-[0.98] border border-white/10"
            >
              Open in {isIOS ? "Apple Maps" : "Google Maps"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
