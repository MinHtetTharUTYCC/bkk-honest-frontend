// Global fetch wrapper that automatically handles API base URL
// Works in both browser and server environments

// Function to get the API base URL
async function getApiBaseUrl(): Promise<string> {
  // Try to get from environment
  let baseURL = process.env.NEXT_PUBLIC_API_URL;
  
  // If not available, try to load from .env files (server-side only)
  if (!baseURL && typeof window === "undefined") {
    try {
      const dotenv = await import('dotenv');
      const path = await import('path');
      
      // Load .env.local
      const envLocal = dotenv.config({ path: path.join(process.cwd(), '.env.local') });
      if (envLocal.parsed?.NEXT_PUBLIC_API_URL) {
        baseURL = envLocal.parsed.NEXT_PUBLIC_API_URL;
      }
      
      // Fallback: load .env
      if (!baseURL) {
        const env = dotenv.config({ path: path.join(process.cwd(), '.env') });
        if (env.parsed?.NEXT_PUBLIC_API_URL) {
          baseURL = env.parsed.NEXT_PUBLIC_API_URL;
        }
      }
    } catch (e) {
      console.warn('[Fetch Wrapper] Could not load dotenv:', (e as Error).message);
    }
  }
  
  // Browser fallback: try to extract from window location if available
  if (!baseURL && typeof window !== "undefined") {
    // As a fallback, we'll use the hardcoded URL for now
    baseURL = "http://143.110.243.39/bkk-honest-api-server";
  }
  
  // Final fallback
  return baseURL || "http://localhost:3000";
}

// Store original fetch
const originalFetch = global.fetch;

// Cache the base URL to avoid repeated async lookups
let cachedBaseUrl: string | null = null;

// Initialize the base URL cache
(async () => {
  cachedBaseUrl = await getApiBaseUrl();
})();

global.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // Ensure we have the base URL
  if (!cachedBaseUrl) {
    cachedBaseUrl = await getApiBaseUrl();
  }
  
  // Get the URL from input
  let url: string;
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.toString();
  } else if (input instanceof Request) {
    url = input.url;
  } else {
    url = '';
  }

  // If it's a relative URL starting with /, prepend the API base URL
  // Exclude Next.js internal routes and already absolute URLs
  if (url.startsWith('/') && !url.startsWith('/_next') && !url.startsWith('/api/') && !url.includes('://')) {
    const newUrl = `${cachedBaseUrl}${url}`;
    
    console.log(`[Fetch Wrapper] ${url} → ${newUrl}`);
    
    // Create new request with updated URL
    if (typeof input === 'string') {
      input = newUrl;
    } else if (input instanceof URL) {
      input = new URL(newUrl);
    } else if (input instanceof Request) {
      input = new Request(newUrl, {
        method: input.method,
        headers: input.headers,
        body: input.body,
        mode: input.mode,
        credentials: input.credentials,
        cache: input.cache,
        redirect: input.redirect,
        referrer: input.referrer,
        integrity: input.integrity,
      });
    }
  }

  return originalFetch.call(this, input, init);
};

// Test the configuration on load
(async () => {
  const testUrl = await getApiBaseUrl();
  if (typeof window !== "undefined") {
    console.log(`[Fetch Wrapper] Browser - Configured base URL: ${testUrl}`);
  } else {
    console.log(`[Fetch Wrapper] Server - Configured base URL: ${testUrl}`);
  }
})();

export {}; // Make this a module