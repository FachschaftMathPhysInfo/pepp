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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (err) {
                  console.error("Failure in FOUC Script for Theme Rendering:", err);}
              })();
            `,
          }}
        />
      </head>
      <body
        className={cn(
          "flex flex-col bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <Suspense>
          <RefetchProvider>
            <UserProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <Header />
                {children}
                <Toaster richColors />
                <TailwindIndicator />
              </ThemeProvider>
            </UserProvider>
          </RefetchProvider>
        </Suspense>
      </body>
    </html>
  );
}
