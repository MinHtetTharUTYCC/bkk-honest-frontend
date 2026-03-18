import type { Metadata } from 'next';
import { Syne, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/providers/query-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { CityProvider } from '@/components/providers/city-provider';
import { createClient } from '@/lib/supabase/server';
import { Toaster } from 'sonner';
import { GlobalReportModal } from '@/components/report/global-report-modal';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bkkhonest.com';

const syne = Syne({
    variable: '--font-display',
    subsets: ['latin'],
    weight: ['700', '800'],
});

const plusJakartaSans = Plus_Jakarta_Sans({
    variable: '--font-body',
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: 'Honest Bangkok | Scam Alerts, Price Reports & Local Vibes',
    description:
        'A community platform for locals and tourists in Bangkok to share honest tips, real prices, and live city updates.',
    alternates: {
        canonical: '/',
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Refresh session server-side. Note: setAll in createClient (server.ts)
    // will fail in a layout, but getUser() still refreshes the token
    // in the Supabase state for this request.
    const supabase = await createClient();
    await supabase.auth.getUser();

    return (
        <html lang="en">
            <body className={`${syne.variable} ${plusJakartaSans.variable} antialiased`}>
                <AuthProvider>
                    <QueryProvider>
                        <CityProvider>{children}</CityProvider>
                        <GlobalReportModal />
                    </QueryProvider>
                </AuthProvider>
                <Toaster position="top-center" richColors />
            </body>
        </html>
    );
}
