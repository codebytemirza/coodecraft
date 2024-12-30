import { Inter } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';
import type { Viewport } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'CodeCraft - Learn Coding the Right Way',
  description: 'Join CodeCraft to master coding skills with easy-to-follow tutorials, interactive exercises, and expert guidance. Perfect for beginners and pros alike.',
  keywords: ['coding', 'programming', 'learn coding', 'CodeCraft', 'interactive coding tutorials', 'programming courses'],
  openGraph: {
    title: 'CodeCraft - Learn Coding the Right Way',
    description: 'Master coding with interactive tutorials and expert guidance. Start your programming journey today with CodeCraft!',
    url: 'https://coodecraft.onrender.com',
    images: [
      {
        url: 'https://coodecraft.onrender.com/_next/image?url=%2Fimages%2Fdashboard-preview.png&w=1200&q=75',
        width: 1200,
        height: 630,
        alt: 'CodeCraft Dashboard Preview',
        type: 'image/png',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@CodeCraft',
    title: 'CodeCraft - Learn Coding the Right Way',
    description: 'Discover interactive coding tutorials and start mastering programming today with CodeCraft.',
    images: [
      {
        url: 'https://coodecraft.onrender.com/_next/image?url=%2Fimages%2Fdashboard-preview.png&w=1200&q=75',
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