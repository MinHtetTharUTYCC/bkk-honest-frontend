# Search Feature Documentation

## Overview

The search feature provides users with a unified search experience across Spots and Scam Alerts, with tab-based filtering, category/sort options, and local search history.

## User Features

### 1. Search-as-You-Type
- Results update as users type (500ms debounce)
- Smooth, responsive search experience
- No "Search" button required

### 2. Dual-Tab Results
- Separate tabs for **Spots** and **Scam Alerts**
- Result count badges on each tab
- Consistent card layouts from existing components

### 3. Filtering
- **Category Filter**: Apply to both tabs
- **Sort Options**: "Most Popular" or "Newest First"
- **City Selection**: Controlled by global CityProvider (topbar)
- All filters persist in URL

### 4. Search History
- Automatically saves recent searches to localStorage
- Max 15 searches stored per device
- Duplicate searches are deduplicated (newest on top)
- Click history item to repeat search
- Remove individual items or clear all history

### 5. Pagination
- Infinite scroll pattern
- Loads 10 items per page
- Automatic loading when scrolling near bottom
- Loading state feedback

### 6. Empty States
- When no search query: Shows recent searches (if any)
- When no results: Clear "No [type] found" message
- Loading skeletons during fetch

## Technical Implementation

### Route
```
GET /search
  Query Params: ?q=search&categoryId=X&sort=Y&tab=Z
```

### State Management
- **URL-based**: All state persisted in query parameters
- **localStorage**: Search history only
- **React State**: Debounced search value for real-time UX
- **React Query**: Results caching and pagination

### API Endpoints Used
```
GET /spots
  ?search=q
  &categoryId=id
  &cityId=id
  &sort=newest|popular
  &skip=0&take=10

GET /scam-alerts
  ?search=q
  &categoryId=id
  &cityId=id
  &sort=newest|popular
  &skip=0&take=10
```

**No custom search endpoints needed** - existing endpoints fully support search with filtering.

## Architecture

```
┌─ /search (main page)
│
├─ SearchInput (with event handlers for focus/blur/keydown)
├─ SearchHistoryDropdown (shows on focus when empty)
│
├─ SearchFilters (sidebar)
│  ├─ Category Dropdown
│  └─ Sort Dropdown
│
└─ SearchResultsTabs
   ├─ Spots Tab
   │  ├─ SpotCard (reused)
   │  └─ Infinite Scroll
   └─ Scam Alerts Tab
      ├─ ScamAlertCard (reused)
      └─ Infinite Scroll
```

## Component Details

### SearchInput
- **Location**: `components/ui/search-input.tsx`
- **Props**: value, onChange, onFocus, onBlur, onKeyDown, placeholder
- **Behavior**: Focus triggers history dropdown (if no input)

### SearchFilters
- **Location**: `components/search/search-filters.tsx`
- **Features**:
  - Category dropdown (loads from useCategories hook)
  - Sort toggle
  - Auto-updates URL on change
  - Uses existing Dropdown component

### SearchResultsTabs
- **Location**: `components/search/search-results-tabs.tsx`
- **Features**:
  - Dual tabs with result counts
  - Infinite scroll per tab
  - Loading states
  - Reuses SpotCard and ScamAlertCard
  - useInfiniteQuery for pagination

### SearchHistoryDropdown
- **Location**: `components/search/search-history-dropdown.tsx`
- **Features**:
  - Shows on focus when input is empty
  - Displays search + filters applied
  - Remove button on hover
  - Clear all button
  - Click to apply search

### useSearchHistory Hook
- **Location**: `hooks/use-search-history.ts`
- **Functions**:
  - `addSearch(item)` - Add/update search
  - `removeSearch(index)` - Remove by index
  - `clearHistory()` - Clear all
  - `history` - Array of recent searches
  - `isClient` - Hydration check
- **Storage**: localStorage key = `search_history`
- **Format**: JSON array of `{q, categoryId?, sort?, timestamp}`

### useInfiniteSpots Hook
- **Location**: `hooks/use-api.ts`
- **Mirrored from**: useInfiniteScamAlerts
- **Params**: search, categoryId, sort, cityId, take
- **Returns**: useInfiniteQuery result with pagination

## URL Query Parameters

| Param | Type | Example | Required |
|-------|------|---------|----------|
| `q` | string | `?q=nightclub` | No |
| `categoryId` | string (cuid) | `?categoryId=clx4qyxxx...` | No |
| `sort` | enum | `?sort=newest` | No (default: popular) |
| `tab` | enum | `?tab=scams` | No (default: spots) |

**Example URLs**:
- `/search` - Empty search
- `/search?q=club` - Search for "club"
- `/search?q=club&categoryId=xyz&sort=newest` - With filters
- `/search?q=scam&tab=scams` - Start on Scam Alerts tab
- `/search?q=club&categoryId=xyz&sort=newest&tab=scams` - Full state

## Responsive Design

### Mobile
- Full-width search input
- Filters in dropdown/collapsible section
- Single column results
- Bottom navigation preserved

### Desktop
- Search input + filters bar at top
- Sidebar filters (sticky on scroll)
- Two-column layout (filters + results)
- Full navigation intact

## Performance Optimizations

1. **Debounced Search** (500ms)
   - Prevents excessive API calls
   - Smooth UX without flickering

2. **React Query Caching**
   - Deduplicates identical requests
   - Caches results per parameter set

3. **Infinite Scroll**
   - Loads 10 items at a time
   - No unnecessary data fetching

4. **localStorage for History**
   - Minimal overhead (~1KB for 15 searches)
   - No server calls needed
   - Fast retrieval

5. **Reused Components**
   - SpotCard and ScamAlertCard already optimized
   - No duplication of rendering logic

## Browser Compatibility

- Modern browsers with localStorage support
- Requires JavaScript enabled
- React 19+, Next.js 16+
- Graceful degradation without localStorage

## Future Enhancements

1. **Backend Search Endpoint**
   - Unified `/search/global` endpoint
   - Mix results by relevance
   - Advanced full-text search

2. **Search Analytics**
   - Track popular searches
   - Recommend trending searches
   - User search patterns

3. **Advanced Filters**
   - Price range
   - Ratings
   - Time-based (open now, hours)
   - Distance-based

4. **Search Shortcuts**
   - Quick category filters (pills)
   - Location-based quick search
   - Favorite searches

5. **AI-Powered**
   - Search suggestions
   - Auto-complete
   - Typo correction

## Testing Checklist

- [ ] Search loads results with debounce
- [ ] Empty search shows history (if exists)
- [ ] Category filter works on both tabs
- [ ] Sort toggle switches between popular/newest
- [ ] Infinite scroll loads more items
- [ ] Tab switching preserves search
- [ ] URL params persist on refresh
- [ ] History adds and removes correctly
- [ ] Mobile layout is responsive
- [ ] Loading states appear
- [ ] Empty results state displays
- [ ] Back button works correctly
- [ ] localStorage stores history (check DevTools)

## Troubleshooting

**Search not working?**
- Check API endpoints respond to search parameter
- Verify city selection (should be set)
- Check browser console for errors
- Ensure React Query is configured

**History not persisting?**
- Check localStorage is enabled
- Verify browser DevTools > Application > localStorage
- Look for `search_history` key
- Check console for any errors

**Filters not applying?**
- Verify URL updates when filter changes
- Check category list loads correctly
- Ensure sort selection updates URL

## Code References

- Main page: `src/app/(main)/search/page.tsx`
- Components: `src/components/search/*`
- Hooks: `src/hooks/use-api.ts`, `src/hooks/use-search-history.ts`
- UI: `src/components/ui/tabs.tsx`, `src/components/ui/select.tsx`
