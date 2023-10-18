export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header>Header</header>
      <main>{children}</main>
      <footer>Footer</footer>
    </>
  );
}
