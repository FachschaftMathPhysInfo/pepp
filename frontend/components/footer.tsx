import {Bug, Github} from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="bottom-0 left-0 w-full py-5 px-10 text-sm text-muted-foreground border-t mt-5 flex items-center justify-between">
      <span>
        Built by{" "}
        <a className="cursor-pointer underline" href="https://mathphys.info">
          Fachschaft MathPhysInfo
        </a>{" "}
        at Heidelberg University.{" "}
      </span>

      <span className={'flex gap-x-4 items-center'}>
        <Link href={'https://github.com/FachschaftMathPhysInfo/pepp'}>
          <Github className={'stroke-muted-foreground'}/>
        </Link>
        <Link href={'https://github.com/FachschaftMathPhysInfo/pepp/issues/new?template=bug_report.md'}>
          <Bug className={'stroke-muted-foreground'}/>
        </Link>
      </span>
    </footer>
  );
}
