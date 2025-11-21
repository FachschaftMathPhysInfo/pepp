"use client";

import { Bug } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";

export function Footer() {
  const { resolvedTheme } = useTheme();

  return (
    <footer className="bottom-0 left-0 w-full py-5 px-10 text-sm text-muted-foreground border-t mt-5 flex flex-col gap-y-2 md:flex-row md:items-center sm:justify-between">
      <span>
        Built by{" "}
        <a className="cursor-pointer underline" href="https://mathphys.info">
          Fachschaft MathPhysInfo
        </a>{" "}
        at Heidelberg University.{" "}
      </span>

      <span className="text-sm text-muted-foreground">
        Build v{process.env.NEXT_PUBLIC_APP_VERSION}
      </span>

      <span className={"flex gap-x-4 items-center"}>
        <Link href={"https://github.com/FachschaftMathPhysInfo/pepp"}>
          <Image
            suppressHydrationWarning
            src={
              resolvedTheme === "light"
                ? "/github_light.svg"
                : "/github_dark.svg"
            }
            alt={"GitHub Logo"}
            width={24}
            height={24}
          />
        </Link>
        <Link
          href={
            "https://github.com/FachschaftMathPhysInfo/pepp/issues/new?template=bug_report.md"
          }
        >
          <Bug className={"stroke-muted-foreground"} />
        </Link>
      </span>
    </footer>
  );
}
