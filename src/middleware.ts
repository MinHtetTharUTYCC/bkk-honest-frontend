import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Remove basePath if it exists
  const path = pathname.replace(/^\/bkk-honest/, '');

  // Match old spot routes: /spots/[id]
  const spotMatch = path.match(/^\/spots\/([a-z0-9]+)(?:\/)?$/i);
  if (spotMatch && !path.includes('[')) {
    const spotId = spotMatch[1];
    // Redirect to a temporary redirect page that will handle the slug lookup
    return NextResponse.redirect(
      new URL(`/bkk-honest/redirect/spot/${spotId}`, request.url)
    );
  }

  // Match old scam-alerts routes: /scam-alerts/[id]
  const scamMatch = path.match(/^\/scam-alerts\/([a-z0-9]+)(?:\/)?$/i);
  if (scamMatch && !path.includes('[')) {
    const alertId = scamMatch[1];
    return NextResponse.redirect(
      new URL(`/bkk-honest/redirect/scam-alert/${alertId}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/bkk-honest/spots/:path*',
    '/bkk-honest/scam-alerts/:path*',
  ],
};
