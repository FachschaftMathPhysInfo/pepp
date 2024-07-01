import * as React from "react"
import {LucideExternalLink} from "lucide-react";
import Image from "next/image";
import {Icon} from "lucide-react";

export interface HeaderProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
}

const Header = React.forwardRef<HTMLInputElement, HeaderProps>(
    ({className, type, ...props}, ref) => {
        return (
            <div className="w-full h-20 flex flex-row items-center justify-between px-12 pt-5 mb-5">
                <Image src="/logo.png" alt="Logo der Fachschaft" width="200" height="20"></Image>
                <span className="flex flex-row items-center justify-between w-1/6">
                        <a>Kontakt</a>
                            <a className="flex flex-row items-center">Homepage
                                <LucideExternalLink className="ms-1" size="14"></LucideExternalLink>
                            </a>

                    </span>
            </div>
        )
    }
)
Header.displayName = "Header"

export {Header}
