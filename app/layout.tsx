import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { NotificationProvider } from "@/lib/notifications";
import { CommandPaletteProvider } from "@/components/command-palette-provider";
import { ActivityProvider } from "@/lib/activity";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus - Modern SaaS Dashboard",
  description: "The best Next.js application with modern UI and powerful features",
  keywords: ["Next.js", "React", "SaaS", "Dashboard", "Analytics"],
  authors: [{ name: "Nexus Team" }],
  openGraph: {
    title: "Nexus - Modern SaaS Dashboard",
    description: "The best Next.js application with modern UI and powerful features",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <ActivityProvider>
              <NotificationProvider>
                <CommandPaletteProvider>
                  {children}
                  <Toaster />
                  <Sonner position="bottom-right" richColors />
                </CommandPaletteProvider>
              </NotificationProvider>
            </ActivityProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
