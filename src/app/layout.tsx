import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CityProvider } from "@/components/providers/city-provider";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Honest Bangkok | Scam Alerts, Price Reports & Local Vibes",
  description: "A community platform for locals and tourists in Bangkok to share honest tips, real prices, and live city updates.",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <QueryProvider>
            <CityProvider>
              {children}
            </CityProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
