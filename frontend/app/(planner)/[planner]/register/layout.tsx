interface RegistrationLayoutProps {
  children: React.ReactNode;
}

export default function RegistrationLayout({
  children,
}: RegistrationLayoutProps) {
  return (
    <>
      <main className="flex justify-center">{children}</main>
    </>
  );
}
