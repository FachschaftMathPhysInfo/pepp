import Image from "next/image";
import Link from "next/link";

const linkStyling = "text-red-700"
const headerStyling = "text-2xl"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
          <h1 className={headerStyling}>
              Under Development, see
              <Link href="/form-tutor" className={linkStyling}> /form-tutor </Link>
              for registrations
          </h1>
    </main>
  );
}
