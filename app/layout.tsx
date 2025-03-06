import './globals.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Footer from './footer';

export const metadata: Metadata = {
  title: 'Claim Deployments Demo',
  description: 'Claiming deployments using Project transfer flow'
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.className} ${geistMono.className} antialiased h-full`}
    >
      <body className="flex min-h-full flex-col justify-between items-center sm:bg-neutral-50 sm:px-6">
        <div className="flex-1 sm:flex-none bg-white rounded-xl sm:shadow-md overflow-hidden sm:border sm:border-neutral-200 p-6 sm:my-auto w-full max-w-2xl">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
