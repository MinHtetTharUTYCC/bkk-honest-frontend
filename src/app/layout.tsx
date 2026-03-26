import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/providers/query-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { CityProvider } from '@/components/providers/city-provider';
import { Toaster } from 'sonner';
import { GlobalReportModal } from '@/components/report/global-report-modal';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bkkhonest.com';

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
    display: 'swap',
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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} antialiased font-sans`}>
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
