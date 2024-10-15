import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/header";
import { Providers } from "./providers";
import {Footer} from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vorkurs",
  description: "Dashboard und Infoseite des Vorkurses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Providers>
        <Header />
        <body className={inter.className}><div className="mt-[60px]">{children}</div></body>
        <Toaster />
      </Providers>
      <Footer />
    </html>
  );
}
