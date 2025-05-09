export default function Layout({
  auth,
  children,
}: {
  auth: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <>
      <div>{auth}</div>
      <div>{children}</div>
    </>
  )
}
