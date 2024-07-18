import * as React from "react"
import {LucideExternalLink} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// TODO: add actual links
const Header = () => {
    return (
        <div className="w-full h-20 flex flex-row items-center justify-between px-4 pt-5 mb-5 md:px-12">
            <Image src="/logo.png" alt="Logo der Fachschaft" width="200" height="20" />
            <span className="flex flex-row items-center justify-between w-auto space-x-0.5 sm:w-1/6 sm:space-x-0">
                <Link href="/" className="mr-5">Kontakt</Link>
                <Link href="/" className="flex flex-row items-center">Homepage
                    <LucideExternalLink className="ml-1" size="14"/>
                </Link>
            </span>
        </div>
    );
}

export default Header;


Header.displayName = "Header"

export {Header}
