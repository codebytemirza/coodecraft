export const metadata = {
  title: 'Admin - CodeCraft Academy',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 