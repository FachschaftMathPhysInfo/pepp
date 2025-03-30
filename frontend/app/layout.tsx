import { Inter as FontSans } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { UserProvider, ThemeProvider } from "@/components/providers";
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
    <html lang="de">
      <body
        className={cn(
          "flex flex-col bg-background font-sans antialiased",
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
              <Header />
              {children}
              <Toaster />
              <TailwindIndicator />
            </ThemeProvider>
          </UserProvider>
        </Suspense>
      </body>
    </html>
  );
}
