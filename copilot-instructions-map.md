Please build a Map feature for bkk-honest-frontend using Next.js App Router, Mapbox GL JS (via react-map-gl), and Framer Motion. 

The API endpoints and React Query hooks (`useNearbySpots`, `usePopularArea`, and `useCategories`) are already defined in `src/hooks/use-api.ts`. 
The `useNearbySpots` hook returns data matching the existing Spot interface.

Requirements:
1.  **File to create/update**: `/src/app/(main)/map/page.tsx`
2.  **Environment**: Use `process.env.NEXT_PUBLIC_MAPBOX_TOKEN` for the Mapbox token.
3.  **State Management**:
    -   Keep track of `viewport` (latitude, longitude, zoom).
    -   Keep track of `userLocation` (if available from geolocation).
    -   Keep track of `selectedSpot` (for the bottom sheet).
    -   Keep track of `selectedCategory` (string | null, for the category filter).
4.  **Data Fetching**:
    -   Use `usePopularArea()` to get fallback coordinates.
    -   Use the browser's `navigator.geolocation` on mount to get the user's location. If denied or unavailable, fall back to the popular area coordinates. Set the map center to this location initially.
    -   Use `useNearbySpots({ latitude, longitude, distance, categoryId })`. Only fetch when `zoom > 13` (to avoid massive queries). If `zoom <= 13`, show a small overlay or toast saying "Zoom in to see spots". Pass the current center latitude/longitude from the viewport state when the map stops moving (`onMoveEnd`).
5.  **UI Components**:
    -   **Map Base**: A full-screen `react-map-gl` Map component using `mapbox://styles/mapbox/dark-v11`.
    -   **Category Filter Bar**: A horizontal scrolling row of pills at the top of the screen (absolute positioned over the map). Include "All" and map through `useCategories()`. Clicking a pill updates the `selectedCategory` state.
    -   **Markers**:
        -   Render a pulsing blue dot for the `userLocation` (if available).
        -   Render custom markers for each spot returned from `useNearbySpots`. Color code them based on the spot's category name (e.g., Food = Orange, Nightlife = Purple, Market = Green, defaults to Amber). You can use `lucide-react` icons inside a rounded HTML div for the marker. Clicking a marker sets `selectedSpot`.
    -   **Bottom Sheet (Selected Spot)**:
        -   When a spot is selected, animate a bottom sheet sliding up using `framer-motion` (`<motion.div>`).
        -   The sheet should display:
            -   Spot name and category name.
            -   A small preview image (if `spot.imageUrl` exists).
            -   Quick stats (Price reports count, Vibe checks count, Community tips count) using `lucide-react` icons.
            -   A large "Navigate" button. Clicking this should call `window.open('https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}', '_blank')`.
        -   Clicking anywhere else on the map or an "X" button should close the sheet (`selectedSpot = null`).
6.  **Styling**: Use Tailwind CSS matching the existing "Dark Night Market" aesthetic (black/dark gray backgrounds, white/amber text, glowing borders).

Write the complete code for `/src/app/(main)/map/page.tsx`. Provide only the code.
