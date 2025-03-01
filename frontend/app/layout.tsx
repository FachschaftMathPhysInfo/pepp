import { Inter as FontSans } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import {
  UserProvider,
  ThemeProvider,
  UmbrellaProvider,
} from "@/components/providers";
import Header from "@/components/header";
import { Suspense } from "react";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontHeading = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});

export const metadata = {
  title: {
    default: siteConfig.name,
  },
  description: siteConfig.description,
  keywords: ["pepp"],
  creator: "Fachschaft MathPhysInfo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head />
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased max-w-xm",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <Suspense>
          <UserProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <UmbrellaProvider>
                <Header />
                {children}
                <Toaster />
                <TailwindIndicator />
              </UmbrellaProvider>
            </ThemeProvider>
          </UserProvider>
        </Suspense>
      </body>
    </html>
  );
}
