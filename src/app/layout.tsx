import { Inter } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CoodeCraft',
  description: 'Learn coding with CodeCraft',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    images: [
      {
        url: 'https://coodecraft.onrender.com/images/dashboard-preview.png',
        width: 1200,
        height: 630,
        alt: 'CodeCraft Dashboard Preview',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}