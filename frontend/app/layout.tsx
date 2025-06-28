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
  RefetchProvider,
} from "@/components/providers";
import Header from "@/components/header";
import React, { Suspense } from "react";

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
    template: "",
    default: siteConfig.name,
  },
  description: siteConfig.description,
  keywords: ["pepp"],
  creator: "Fachschaft MathPhysInfo",
  openGraph: {
    type: "website",
    locale: "de_DE",
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
      <body
        className={cn(
          "flex w-screen flex-col bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense>
            <RefetchProvider>
              <UserProvider>
                <Header />
                {children}
                <Toaster richColors />
                <TailwindIndicator />
              </UserProvider>
            </RefetchProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
