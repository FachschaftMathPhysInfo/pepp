import { Footer } from "@/components/footer";
import Header from "@/components/header";

interface RegistrationLayoutProps {
  children: React.ReactNode;
}

export default function RegistrationLayout({ children }: RegistrationLayoutProps) {
  return (
    <div className="h-screen flex flex-col justify-between">
      <Header />
      <div />
      <main className="flex justify-center">{children}</main>
      <Footer />
    </div>
  );
}
