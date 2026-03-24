# Frontend Performance & Security Refactor - Summary

## Core Logic Changes

### 1. Performance: Hover-to-Prefetch (Predictive Loading)
Implemented a "Hover-to-Prefetch" strategy across the most common navigation paths to make the UI feel instantaneous. When a user hovers over a target, TanStack Query begins fetching the data before the click even happens.

*   **Spot Cards:** Hovering over a spot on the Discovery or Home page now prefetches the Spot Details, the first 6 Gallery images, and the "TRY" Community Tips.
*   **Profile Tabs:** Hovering over the "Scams", "Tips", "Prices", or "Spots" tabs in the profile now prefetches the respective infinite list data.
*   **Discovery Categories:** Hovering over category pills (e.g., "Food", "Nightlife") prefetches the filtered infinite list of spots.

### 2. Performance: Cache Optimization
Refined `staleTime` and `gcTime` configurations to balance data freshness with instant responsiveness.

*   **Global Metadata:** Cities and Categories now have a **24-hour `staleTime`** and **48-hour `gcTime`**, as they are managed strictly by developers.
*   **Discovery Feed:** `useSpots` and `useInfiniteSpots` now have a **5-minute `staleTime`** (increased from 2m), making tab-switching and back-navigation instant.
*   **Server-Side Prefetching:** Updated the Home page (`page.tsx`) to include explicit `staleTime` values during hydration, preventing immediate client-side refetches upon mounting.

### 3. Security: "Me" Pattern Single Source of Truth
Reinforced the authentication bridge between the frontend and backend.

*   **JWT Enforcement:** Verified that the `lib/api.ts` interceptor correctly injects the Supabase Access Token into the `Authorization` header for every request.
*   **Me/Mine Endpoints:** Confirmed that the frontend uses `/profiles/me`, `/scam-alerts/mine`, etc., which forces the NestJS backend to identify the user via the JWT rather than a client-provided ID. This prevents IDOR (Insecure Direct Object Reference) vulnerabilities.

---

## Files Touched

| File | Change Type | Description |
| :--- | :--- | :--- |
| `src/hooks/use-api.ts` | **Refactor** | Increased `staleTime` for Cities (24h), Categories (24h), and Spots (5m). |
| `src/components/profile/profile-tabs.tsx` | **Feature** | Added `prefetchTab` helper and `onMouseEnter` triggers to tab buttons. |
| `src/components/spots/spot-card.tsx` | **Feature** | Added `prefetchSpot` helper to pre-load details, gallery, and tips on hover. |
| `src/app/(main)/spots/[citySlug]/[spotSlug]/page.tsx` | **Feature** | Added `prefetchTab` to the Spot Detail page internal tabs (Gallery, Tips, etc.). |
| `src/app/(main)/spots/page.tsx` | **Feature** | Added `prefetchCategory` to discovery pills to speed up filtering. |
| `src/app/(main)/page.tsx` | **Refactor** | Added `staleTime` to server-side prefetch calls to match client-side expectations. |

---

## Key Code Snippets

### Predictive Prefetching (Spot Card Example)
```typescript
const prefetchSpot = () => {
    // Prefetch Spot Detail
    queryClient.prefetchQuery({ queryKey: ['spot', citySlug, spotSlug] });
    // Prefetch Gallery (First 6)
    queryClient.prefetchQuery({ queryKey: ['gallery', id, 6, 'newest'] });
    // Prefetch Tips
    queryClient.prefetchInfiniteQuery({
        queryKey: ['tips-infinite', id, 'TRY', 'popular'],
        initialPageParam: 0,
    });
};

// Applied to the card container
<div onMouseEnter={prefetchSpot} onClick={...}>
```

### Metadata Cache Tuning
```typescript
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => { ... },
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
        gcTime: 48 * 60 * 60 * 1000, // 48 hours
    });
}
```
