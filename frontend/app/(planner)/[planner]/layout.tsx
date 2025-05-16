export default function Layout({
  closeup,
  children,
}: {
  closeup: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      {closeup}
      {children}
    </>
  );
}
