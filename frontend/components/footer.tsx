"use client"

import React, { useEffect, useState } from "react";

export function Footer() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <footer className="bottom-0 left-0 w-full p-10 text-sm text-muted-foreground">
      <span>
        Built by{" "}
        <a className="cursor-pointer underline" href="https://mathphys.info">
          Fachschaft MathPhysInfo
        </a>{" "}
        at Heidelberg University.{" "}
      </span>
      <span>
        The source code is available on{" "}
        <a
          className="cursor-pointer underline"
          href="https://github.com/FachschaftMathPhysInfo/pepp"
        >
          GitHub
        </a>
        .
      </span>
    </footer>
  );
}
