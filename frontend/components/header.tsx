import * as React from "react"
import {LucideExternalLink} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// TODO: add actual links
const Header = () => {
    return (
        <div className="w-full h-20 flex flex-row items-center justify-between px-12 pt-5 mb-5">
            <Image src="/logo.png" alt="Logo der Fachschaft" width="200" height="20"></Image>
            <span className="flex flex-row items-center justify-between w-1/6">
                <Link href="/">Kontakt</Link>
                <Link href="/" className="flex flex-row items-center">Homepage
                    <LucideExternalLink className="ms-1" size="14"></LucideExternalLink>
                </Link>
            </span>
        </div>
    )
}

Header.displayName = "Header"

export {Header}
