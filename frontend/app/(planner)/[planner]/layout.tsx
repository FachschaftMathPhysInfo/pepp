export default function Layout({
  closeup,
  auth,
  children,
}: {
  closeup: React.ReactNode;
  auth: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      {closeup}
      {auth}
      {children}
    </>
  );
}
