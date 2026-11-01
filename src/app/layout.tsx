import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '../components/Sidebar';

export const metadata: Metadata = {
  title: 'VoltMart B2B — Electrical Wholesale Management Dashboard',
  description: 'Enterprise wholesale management dashboard for manufacturers, distributors, and electrical shop owners.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-slate-950">
      <body className="min-h-full bg-slate-950 text-slate-100 flex font-sans antialiased">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen bg-slate-950 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
