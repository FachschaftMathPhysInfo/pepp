import {Inter as FontSans} from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";
import {Toaster} from "@/components/ui/sonner";
import {cn} from "@/lib/utils";
import {siteConfig} from "@/config/site";
import {TailwindIndicator} from "@/components/tailwind-indicator";
import {RefetchProvider,} from "@/components/provider/refetch-provider";
import Header from "@/components/header";
import React, {Suspense} from "react";
import {Metadata} from "next";
import {UserProvider} from "@/components/provider/user-provider";
import {ThemeProvider} from "@/components/provider/theme-provider";
import {LabelsProvider} from "@/components/provider/labels-provider";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontHeading = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: {
    template: "",
    default: siteConfig.name,
  },
  description: siteConfig.description,
  keywords: ["pepp", "vorkurs", "uni heidelberg", "universität heidelberg"],
  creator: "Fachschaft MathPhysInfo",
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  applicationName: "Pepp",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({children}: RootLayoutProps) {
  return (
    <html lang="de" suppressHydrationWarning>
    <head><title>{siteConfig.name}</title></head>
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
          <LabelsProvider>
            <UserProvider>
              <Header/>
              {children}
              <Toaster richColors/>
              <TailwindIndicator/>
            </UserProvider>
          </LabelsProvider>
        </RefetchProvider>
      </Suspense>
    </ThemeProvider>
    </body>
    </html>
  );
}
