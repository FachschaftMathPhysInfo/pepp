import { Footer } from "@/components/footer";
import Header from "@/components/header";

interface RegistrationLayoutProps {
  children: React.ReactNode;
}

export default function RegistrationLayout({ children }: RegistrationLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 space-y-4 pl-6 pr-6">{children}</main>
      <Footer />
    </div>
  );
}
