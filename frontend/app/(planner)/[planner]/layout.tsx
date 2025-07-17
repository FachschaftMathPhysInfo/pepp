import React from "react";

interface PLayoutProps {
  registration: React.ReactNode;
  children: React.ReactNode;
}

export default function PLayout({ children, registration }: PLayoutProps) {
  return (
    <>
      {children}
      {registration}
    </>
  );
}
