import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Medic Centre - Doctor Dashboard',
  description: 'Unified clinical workspace and patient health management ecosystem.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased text-slate-900 bg-slate-50 dark:bg-slate-950 dark:text-slate-50`}>
        {children}
      </body>
    </html>
  );
}