"use client"

import { LucideExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// TODO: add actual links
export default function Header() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <header className="w-full h-20 flex flex-row items-center justify-between px-5">
      <Image
        src="/logo.png"
        alt="Logo der Fachschaft"
        width="200"
        height="20"
      />
      <span className="flex flex-row items-center justify-between w-fit">
        <Link href="/" className="mr-3">
          Kontakt
        </Link>
        <Link href="/" className="flex flex-row items-center">
          Homepage
          <LucideExternalLink className="ml-1" size="14" />
        </Link>
      </span>
    </header>
  );
}
