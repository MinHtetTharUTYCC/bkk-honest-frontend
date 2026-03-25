# SSR Migration for Spot Details (Sub-Routes Pattern)

## The "Why": SEO, Performance, & Architecture

### 1. The SEO Goldmine (The Biggest Reason)
Think about what people search for on Google:
- "Is Jazz Bar Bangkok a scam?"
- "Jazz Bar Bangkok prices"
- "Tips for visiting Jazz Bar Bangkok"

If you have a monolithic page, Google tries to rank one single URL for all those distinct intents.
If you use sub-routes, you get multiple indexed pages for a single spot:
- `bkkhonest.com/spots/bkk/jazz-bar` (Ranks for general searches)
- `bkkhonest.com/spots/bkk/jazz-bar/prices` (Ranks for price searches, SSRs the price data)
- `bkkhonest.com/spots/bkk/jazz-bar/tips` (Ranks for tips/scam searches, SSRs the tip text)

Your Community Tips and Price Reports contain the most valuable, human-written content on your platform. You want search engines to read that text immediately in the raw HTML, not wait for a React query to fire.

### 2. Performance & Payload Size
Right now, your `spot-detail-client.tsx` is likely a massive file downloading the logic for the gallery, the voting system, the price charts, and the tip infinite scroll all at once.

By using sub-routes:
- A user landing on the "Overview" doesn't download the heavy JavaScript for the image gallery or the infinite scroll hook for tips.
- The page loads instantly.
- When they click the "Tips" tab, Next.js instantly swaps to the `/tips` route, which is already prefetched in the background by the Next.js `<Link>` component.

### 3. Cleaner Codebase
Managing 5 complex data states (Overview, Gallery, Tips, Prices, Vibes) inside one massive client component (`spot-detail-client.tsx`) is a recipe for spaghetti code and hard-to-trace re-renders.

Splitting them means:
- `/spots/[citySlug]/[spotSlug]/layout.tsx` -> Fetches core spot data and renders the Header & Tab Bar.
- `/spots/[citySlug]/[spotSlug]/page.tsx` -> Just the Overview UI.
- `/spots/[citySlug]/[spotSlug]/tips/page.tsx` -> Just the Tips UI (and SSRs the first page of tips).

## Battle Plan: Step-by-Step Execution

### Phase 1: Structural Changes (Folders & Layout)
1. **Create the Route Folders**: We will create dedicated folders for each tab inside `app/(main)/spots/[citySlug]/[spotSlug]/`:
   - `/tips`
   - `/prices`
   - `/gallery`
   - `/vibes`
2. **Extract Types**: Extract types into `src/types/spot.ts`.
3. **Refactor `layout.tsx`**:
   - Currently, `layout.tsx` only handles SEO. We will upgrade it to act as the shared shell for the spot details.
   - It will fetch the core Spot Data (Name, Image, Category) on the server.
   - It will render a new `<SpotHeader>` component (containing the cover image, title, and the Tab Navigation Bar).
   - Below the header, it will render `{children}` so the specific tab content can mount.
4. **Update the Tab Bar**:
   - We will replace the current React state-based tabs (`?tab=...`) with standard Next.js `<Link>` components pointing to the new physical URLs (e.g., `href={/spots/${citySlug}/${spotSlug}/tips}`).

### Phase 2: Splitting the Monolith (`spot-detail-client.tsx`)
We will break the massive `spot-detail-client.tsx` file into smaller, isolated client components:
- `components/spots/spot-header.tsx` (The top section with the image and action buttons).
- `components/spots/tabs/tips-tab.tsx`
- `components/spots/tabs/prices-tab.tsx`
- `components/spots/tabs/vibes-tab.tsx`
- `components/spots/tabs/gallery-tab.tsx`

This alone will drastically reduce the initial JavaScript bundle size.

### Phase 3: Server-Side Rendering (SSR) & SEO
This is where the magic happens. For each new route, we will implement SSR to enable unique SEO metadata per tab:

- **`tips/page.tsx`**:
  - **Server**: Fetches the first page of Community Tips directly via a server-side fetch.
  - **SEO**: Uses `generateMetadata` to set the title to something like "Community Tips & Alerts for [Spot Name] | BKK Honest".
  - **Client**: Passes the prefetched tips into `<TipsTab initialData={tips} />`, ensuring the content is in the raw HTML for Googlebot.

- **`prices/page.tsx` & `vibes/page.tsx`**:
  - Follow the exact same pattern. The server fetches the initial data, sets specific SEO meta tags, and passes the data to the client component.

- **`page.tsx` (The Default Route)**:
  - We will set this to simply redirect to the `/tips` route (or whatever we want the default landing tab to be), or we can render an "Overview" component here.

## Summary of Benefits After Completion
- **Perfect SEO**: Every tab becomes a unique, indexable URL with its own metadata.
- **Zero Layout Shift**: The `layout.tsx` ensures the spot header never flickers or re-renders when switching tabs.
- **Micro-Bundles**: A user landing on `/tips` will not download the JavaScript required to render the interactive Price charts or the Gallery modal until they actually click those tabs.