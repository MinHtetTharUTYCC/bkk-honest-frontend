'use client';

import { Source, Layer, useMap } from 'react-map-gl/mapbox';
import type { LayerProps } from 'react-map-gl/mapbox';

interface TransitLinesProps {
    id: string;
    data: any; // GeoJSON data
}

export default function TransitLines({ id, data }: TransitLinesProps) {
    // Guard: ensure MapContext is available before rendering Source
    const map = useMap();

    if (!data || !data.features || !map) {
        return null;
    }

    // Use the provided stable ID
    const sourceId = `transit-data-${id}`;

    // Create line layer style
    const lineLayerStyle: LayerProps = {
        id: `transit-lines-${sourceId}`,
        type: 'line',
        layout: {
            'line-join': 'round',
            'line-cap': 'round',
        },
        paint: {
            // Use the color from feature properties
            'line-color': [
                'case',
                ['has', 'color'],
                ['get', 'color'],
                '#FFFFFF', // fallback color
            ],
            'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10,
                2, // At zoom 10, width is 2px
                12,
                4, // At zoom 12, width is 4px
                16,
                8, // At zoom 16, width is 8px
            ],
            'line-opacity': 0.8,
        },
    };

    // Create line outline layer for better visibility
    const lineOutlineStyle: LayerProps = {
        id: `transit-lines-outline-${sourceId}`,
        type: 'line',
        layout: {
            'line-join': 'round',
            'line-cap': 'round',
        },
        paint: {
            'line-color': '#000000',
            'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10,
                3, // Slightly larger than main line
                12,
                5,
                16,
                10,
            ],
            'line-opacity': 0.3,
        },
    };

    return (
        <Source id={sourceId} type="geojson" data={data}>
            {/* Render outline first (appears behind) */}
            <Layer {...lineOutlineStyle} />
            {/* Render main line on top */}
            <Layer {...lineLayerStyle} />
        </Source>
    );
}
