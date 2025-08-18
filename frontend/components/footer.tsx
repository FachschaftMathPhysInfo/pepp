export function Footer() {
  return (
    <footer className="bottom-0 left-0 w-full py-5 px-10 text-sm text-muted-foreground border-t mt-5">
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
