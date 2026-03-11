import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('redirectTo') ?? '/';
  
  // Use the public origin from headers if available (for reverse proxy)
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const origin = `${protocol}://${host}`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure we redirect within the basePath
      const redirectPath = next.startsWith('/bkk-honest') ? next : `/bkk-honest${next}`;
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // return the user to an error page within the basePath
  return NextResponse.redirect(`${origin}/bkk-honest/login?error=Authentication failed`);
}
